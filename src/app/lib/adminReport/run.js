import connectDB from "@/app/lib/db";
import AdminReportSettings from "@/app/lib/models/AdminReportSettings";
import AdminReportLog from "@/app/lib/models/AdminReportLog";
import { sendAdminReportMail } from "@/app/lib/mailer";
import { buildAdminReport } from "./buildReport";
import { buildAdminReportWorkbook } from "./workbook";
import {
  DEFAULT_SETTINGS,
  SEND_GRACE_MS,
  getLatestOccurrence,
  getScheduledPeriod,
  getRollingPeriod,
  formatPeriodLabel,
  formatISTDateTime,
  isoDateIST,
} from "./schedule";

// Gmail rejects messages over 25 MB; keep headroom for base64 overhead.
const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024;
// A "sending" claim older than this is treated as a crashed run.
const STALE_LOCK_MS = 15 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getReportSettings() {
  await connectDB();
  const doc = await AdminReportSettings.findOne({ key: "default" }).lean();
  return { ...DEFAULT_SETTINGS, ...(doc || {}) };
}

// Report recipients come only from ADMIN_REPORT_EMAILS (comma-separated).
export function resolveRecipients() {
  const list = String(process.env.ADMIN_REPORT_EMAILS || "")
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(list)].filter((e) => EMAIL_RE.test(e));
}

export function reportFileName(period) {
  const last = isoDateIST(new Date(period.end.getTime() - 1));
  const first = isoDateIST(period.start);
  // Custom multi-day downloads show the whole range in the name.
  if (period.custom && first !== last) return `Trademilaan_Admin_Report_${first}_to_${last}.xlsx`;
  return `Trademilaan_Admin_Report_${last}.xlsx`;
}

/** Builds the report + Excel for a period (used by send and download). */
export async function generateReport(period, now = new Date()) {
  const report = await buildAdminReport(period, now);
  const xlsxBuffer = await buildAdminReportWorkbook(report);
  return { report, xlsxBuffer, fileName: reportFileName(period) };
}

/**
 * Runs one admin report.
 * - trigger "cron": only sends when the configured time has passed for the
 *   current period and that period was not sent yet (exactly once per period).
 * - trigger "manual": sends now to all configured recipients.
 * - trigger "test": sends now only to `onlyTo`.
 * Returns { status: "sent" | "skipped" | "failed", ... }. Never throws.
 */
export async function runAdminReport({ trigger, onlyTo = null, triggeredBy = null, now = new Date() }) {
  await connectDB();
  const settings = await getReportSettings();

  let period;
  if (trigger === "cron") {
    if (!settings.enabled) return { status: "skipped", reason: "Report is disabled" };
    const occurrence = getLatestOccurrence(settings, now);
    if (now.getTime() - occurrence.getTime() > SEND_GRACE_MS) {
      return { status: "skipped", reason: "Not scheduled now" };
    }
    period = getScheduledPeriod(settings, occurrence);
  } else {
    period = getRollingPeriod(settings, now);
  }

  const base = {
    periodKey: period.periodKey,
    frequency: period.frequency,
    periodStart: period.start,
    periodEnd: period.end,
    trigger,
    triggeredBy,
  };

  let log;
  if (trigger === "cron") {
    // Release claims left behind by a run that crashed mid-way.
    await AdminReportLog.updateMany(
      {
        cronLock: period.periodKey,
        status: "sending",
        updatedAt: { $lt: new Date(now.getTime() - STALE_LOCK_MS) },
      },
      { $set: { status: "failed", error: "Run did not finish (timed out)" }, $unset: { cronLock: 1 } },
    );
    try {
      log = await AdminReportLog.create({ ...base, status: "sending", cronLock: period.periodKey });
    } catch (err) {
      if (err?.code === 11000) {
        return { status: "skipped", reason: "Already sent for this period", periodKey: period.periodKey };
      }
      throw err;
    }
  } else {
    log = await AdminReportLog.create({ ...base, status: "sending" });
  }

  try {
    const recipients = onlyTo ? [String(onlyTo).toLowerCase()] : resolveRecipients();
    if (!recipients.length) {
      throw new Error("No recipients: set ADMIN_REPORT_EMAILS in environment variables");
    }

    const { report, xlsxBuffer, fileName } = await generateReport(period, now);
    const attach = xlsxBuffer.length <= MAX_ATTACHMENT_BYTES;
    const periodLabel = formatPeriodLabel(period);
    const appUrl = (process.env.APP_URL || process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
    const label = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[period.frequency];

    await sendAdminReportMail({
      to: recipients,
      subject: `${trigger === "test" ? "[TEST] " : ""}Trademilaan ${label} Admin Report – ${periodLabel}`,
      periodLabel,
      generatedAtLabel: formatISTDateTime(now),
      summary: report.summary,
      expiringClients: report.clients.filter((c) => c.status === "Expiring soon"),
      xlsxBuffer: attach ? xlsxBuffer : null,
      fileName,
      dashboardUrl: appUrl ? `${appUrl}/admin-dashboard/reports` : null,
    });

    await AdminReportLog.updateOne(
      { _id: log._id },
      {
        $set: {
          status: "sent",
          recipients,
          summary: report.summary,
          fileName,
          sizeBytes: xlsxBuffer.length,
          error: attach ? null : "Excel too large to attach; download from dashboard",
        },
      },
    );
    return { status: "sent", periodKey: period.periodKey, recipients: recipients.length };
  } catch (err) {
    console.error(`[admin-report] ${trigger} run failed:`, err?.message || err);
    await AdminReportLog.updateOne(
      { _id: log._id },
      {
        $set: { status: "failed", error: String(err?.message || err).slice(0, 500) },
        $unset: { cronLock: 1 },
      },
    ).catch(() => {});
    return { status: "failed", error: err?.message || "Report failed", periodKey: period.periodKey };
  }
}
