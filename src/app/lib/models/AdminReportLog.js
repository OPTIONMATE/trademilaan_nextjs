import mongoose from "mongoose";

// One row per report attempt (automatic, manual or test). Drives the history
// table on /admin-dashboard/reports and prevents duplicate automatic sends.
const AdminReportLogSchema = new mongoose.Schema(
  {
    periodKey: { type: String, required: true },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    trigger: { type: String, enum: ["cron", "manual", "test"], required: true },
    status: { type: String, enum: ["sending", "sent", "failed"], required: true },
    // Set to periodKey only while an automatic report is sending or after it
    // was sent. Unique, so two cron triggers firing together (GitHub Actions +
    // Vercel) cannot both send; cleared on failure so the next run retries.
    cronLock: { type: String, default: undefined },
    recipients: { type: [String], default: [] },
    summary: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    fileName: { type: String, default: null },
    sizeBytes: { type: Number, default: null },
    triggeredBy: { type: String, default: null },
  },
  { timestamps: true },
);

AdminReportLogSchema.index({ cronLock: 1 }, { unique: true, sparse: true });
AdminReportLogSchema.index({ periodKey: 1, createdAt: -1 });
AdminReportLogSchema.index({ createdAt: -1 });

export default mongoose.models.AdminReportLog ||
  mongoose.model("AdminReportLog", AdminReportLogSchema);
