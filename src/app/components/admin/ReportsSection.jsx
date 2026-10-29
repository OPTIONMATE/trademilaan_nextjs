"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Save, Send, FlaskConical } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import { getFileNameFromResponse } from "@/app/lib/documentFileName";
import AdminCard from "./ui/AdminCard";
import AdminButton from "./ui/AdminButton";
import AdminBadge from "./ui/AdminBadge";
import AdminSelect from "./ui/AdminSelect";
import AdminInput from "./ui/AdminInput";
import AdminTable from "./ui/AdminTable";
import AdminEmptyState from "./ui/AdminEmptyState";
import { formatAdminDate, formatAdminDateTime, formatINR } from "./ui/adminFormat";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_TONE = { sent: "success", failed: "danger", sending: "pending" };
const TRIGGER_LABEL = { cron: "Automatic", manual: "Manual", test: "Test" };

/**
 * Admin report settings, actions and send history.
 * `history` is the /api/admin/reports payload; `onChanged` reloads it.
 */
export default function ReportsSection({ history, onChanged }) {
  const [form, setForm] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(null); // "save" | "all" | "test" | "download" | logId
  const [notice, setNotice] = useState(null); // { tone, text }

  useEffect(() => {
    fetch("/api/admin/reports/settings")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Request failed (${res.status})`))))
      .then(({ settings }) => setForm(settings))
      .catch((err) => setSettingsError(err.message));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const saveSettings = async () => {
    setBusy("save");
    setNotice(null);
    setFieldErrors({});
    try {
      const res = await fetchWithCsrf("/api/admin/reports/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: form.enabled,
          frequency: form.frequency,
          dayOfWeek: Number(form.dayOfWeek),
          dayOfMonth: Number(form.dayOfMonth),
          time: form.time,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFieldErrors(json.errors || {});
        throw new Error(json.error || "Could not save settings");
      }
      setForm(json.settings);
      setNotice({ tone: "success", text: "Schedule saved." });
      onChanged();
    } catch (err) {
      setNotice({ tone: "danger", text: err.message });
    } finally {
      setBusy(null);
    }
  };

  const sendNow = async (mode) => {
    setBusy(mode);
    setNotice(null);
    try {
      const res = await fetchWithCsrf("/api/admin/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Report failed");
      setNotice({
        tone: "success",
        text: mode === "test" ? "Test report sent to your email." : `Report sent to ${json.recipients} recipient(s).`,
      });
    } catch (err) {
      setNotice({ tone: "danger", text: err.message });
    } finally {
      setBusy(null);
      onChanged();
    }
  };

  const download = async (logId) => {
    setBusy(logId || "download");
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/reports/download${logId ? `?logId=${logId}` : ""}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileNameFromResponse(res, "Trademilaan_Admin_Report.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setNotice({ tone: "danger", text: err.message });
    } finally {
      setBusy(null);
    }
  };

  const status = history?.status;
  const logs = history?.logs || [];

  const columns = [
    {
      key: "createdAt",
      header: "Run at",
      render: (log) => <span className="whitespace-nowrap">{formatAdminDateTime(log.createdAt)}</span>,
    },
    {
      key: "period",
      header: "Period",
      render: (log) => (
        <span className="whitespace-nowrap">
          {formatAdminDate(log.periodStart)} – {formatAdminDate(new Date(new Date(log.periodEnd).getTime() - 1))}
        </span>
      ),
    },
    { key: "trigger", header: "Type", render: (log) => TRIGGER_LABEL[log.trigger] || log.trigger },
    {
      key: "status",
      header: "Status",
      render: (log) => (
        <div className="space-y-1">
          <AdminBadge tone={STATUS_TONE[log.status] || "neutral"} dot>
            {log.status}
          </AdminBadge>
          {log.error && <p className="max-w-xs text-xs text-red-600">{log.error}</p>}
        </div>
      ),
    },
    {
      key: "recipients",
      header: "Recipients",
      render: (log) => (
        <span title={(log.recipients || []).join(", ")}>{(log.recipients || []).length}</span>
      ),
    },
    {
      key: "payments",
      header: "Payments",
      align: "right",
      render: (log) => (log.summary ? log.summary.paymentsCount : "–"),
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      render: (log) => (log.summary ? formatINR(log.summary.revenueTotal) : "–"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (log) => (
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => download(log._id)}
          disabled={busy !== null}
          aria-label="Download this report as Excel"
        >
          {busy === log._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Excel
        </AdminButton>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard
          className="lg:col-span-2"
          title="Schedule"
          description="When the report is emailed automatically. All times are IST."
        >
          {settingsError && <p className="text-sm text-red-600">Unable to load settings: {settingsError}</p>}
          {!settingsError && !form && <p className="text-sm text-neutral-500">Loading settings…</p>}
          {form && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => update("enabled", e.target.checked)}
                  className="h-4 w-4 accent-[#9BE749]"
                />
                Send report automatically
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <AdminSelect
                  id="report-frequency"
                  label="Frequency"
                  value={form.frequency}
                  onChange={(e) => update("frequency", e.target.value)}
                  error={fieldErrors.frequency}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </AdminSelect>

                {form.frequency === "weekly" && (
                  <AdminSelect
                    id="report-day"
                    label="Day"
                    value={form.dayOfWeek}
                    onChange={(e) => update("dayOfWeek", Number(e.target.value))}
                    error={fieldErrors.dayOfWeek}
                  >
                    {WEEKDAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </AdminSelect>
                )}
                {form.frequency === "monthly" && (
                  <AdminSelect
                    id="report-date"
                    label="Day of month"
                    value={form.dayOfMonth}
                    onChange={(e) => update("dayOfMonth", Number(e.target.value))}
                    error={fieldErrors.dayOfMonth}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </AdminSelect>
                )}

                <AdminInput
                  id="report-time"
                  type="time"
                  label="Time (IST)"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  error={fieldErrors.time}
                />
              </div>

              <p className="text-xs text-neutral-500">
                {form.frequency === "daily" && "Each report covers the previous day."}
                {form.frequency === "weekly" && "Each report covers the previous 7 days."}
                {form.frequency === "monthly" && "Each report covers the previous calendar month."}{" "}
                The email usually arrives within an hour of the chosen time.
              </p>


              <div className="flex justify-end">
                <AdminButton onClick={saveSettings} disabled={busy !== null}>
                  {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save schedule
                </AdminButton>
              </div>
            </div>
          )}
        </AdminCard>

        <div className="space-y-6">
          <AdminCard title="Status">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Schedule</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {status ? (status.enabled ? status.schedule : "Paused") : "–"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Next report</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {status?.nextRun ? formatAdminDateTime(status.nextRun) : "–"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Last sent</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {status?.lastSentAt ? formatAdminDateTime(status.lastSentAt) : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Recipients</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{status?.recipients?.length ?? 0}</dd>
              </div>
              {status && !status.cronConfigured && (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  CRON_SECRET is not set on the server, so automatic sending is not active.
                </p>
              )}
            </dl>
          </AdminCard>

          <AdminCard title="Actions" description="Uses data up to now for the selected frequency.">
            <div className="flex flex-col gap-2">
              <AdminButton
                onClick={() => sendNow("all")}
                disabled={busy !== null || !status?.recipients?.length}
              >
                {busy === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send report now
              </AdminButton>
              <AdminButton variant="secondary" onClick={() => sendNow("test")} disabled={busy !== null}>
                {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                Send test to me
              </AdminButton>
              <AdminButton variant="secondary" onClick={() => download(null)} disabled={busy !== null}>
                {busy === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Excel
              </AdminButton>
            </div>
          </AdminCard>
        </div>
      </div>

      <AdminCard title="Report history" description="Every automatic, manual and test report.">
        {logs.length === 0 ? (
          <AdminEmptyState title="No reports yet" description="Reports will appear here once sent." />
        ) : (
          <AdminTable columns={columns} rows={logs} minWidth={860} />
        )}
      </AdminCard>
    </div>
  );
}
