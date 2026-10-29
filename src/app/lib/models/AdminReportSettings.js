import mongoose from "mongoose";

// Single settings document (key: "default") controlling when the periodic
// admin report is sent. Edited from /admin-dashboard/reports; read by the cron
// route. Recipients are not stored here: they come from ADMIN_REPORT_EMAILS.
const AdminReportSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    enabled: { type: Boolean, default: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    // 0 = Sunday ... 6 = Saturday (weekly)
    dayOfWeek: { type: Number, min: 0, max: 6, default: 1 },
    // 1-28 so every month has the day (monthly)
    dayOfMonth: { type: Number, min: 1, max: 31, default: 1 },
    // "HH:mm" in IST
    time: { type: String, default: "09:00", match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.AdminReportSettings ||
  mongoose.model("AdminReportSettings", AdminReportSettingsSchema);
