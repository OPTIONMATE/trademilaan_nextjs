import { NextResponse } from "next/server";
import AdminReportLog from "@/app/lib/models/AdminReportLog";
import { requireAdmin } from "@/app/lib/authServer";
import { getReportSettings, resolveRecipients } from "@/app/lib/adminReport/run";
import { getNextOccurrence, describeSchedule } from "@/app/lib/adminReport/schedule";

// History of report runs + schedule status for /admin-dashboard/reports.
export async function GET(req) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const settings = await getReportSettings();
    const now = new Date();
    const nextRun = settings.enabled ? getNextOccurrence(settings, now) : null;

    const [logs, total, lastSent] = await Promise.all([
      AdminReportLog.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AdminReportLog.countDocuments({}),
      AdminReportLog.findOne({ status: "sent" }).sort({ createdAt: -1 }).lean(),
    ]);
    const recipients = resolveRecipients();

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      status: {
        enabled: settings.enabled,
        schedule: describeSchedule(settings),
        nextRun,
        lastSentAt: lastSent?.createdAt || null,
        recipients,
        cronConfigured: Boolean(process.env.CRON_SECRET),
      },
    });
  } catch (error) {
    if (!error.statusCode) console.error("[admin-report] history:", error.message);
    return NextResponse.json(
      { error: error.statusCode ? error.message : "Something went wrong" },
      { status: error.statusCode || 500 },
    );
  }
}
