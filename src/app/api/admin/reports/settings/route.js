import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import AdminReportSettings from "@/app/lib/models/AdminReportSettings";
import { requireAdmin } from "@/app/lib/authServer";
import { getReportSettings } from "@/app/lib/adminReport/run";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const FREQUENCIES = ["daily", "weekly", "monthly"];

const errorResponse = (error) =>
  NextResponse.json(
    { error: error.statusCode ? error.message : "Something went wrong" },
    { status: error.statusCode || 500 },
  );

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getReportSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    if (!error.statusCode) console.error("[admin-report] settings GET:", error.message);
    return errorResponse(error);
  }
}

export async function PUT(req) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const errors = {};
    const frequency = String(body.frequency || "");
    if (!FREQUENCIES.includes(frequency)) errors.frequency = "Choose daily, weekly or monthly";
    const dayOfWeek = Number(body.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) errors.dayOfWeek = "Invalid day";
    const dayOfMonth = Number(body.dayOfMonth);
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 28) errors.dayOfMonth = "Day must be 1-28";
    const time = String(body.time || "");
    if (!TIME_RE.test(time)) errors.time = "Time must be HH:mm";

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    await connectDB();
    const settings = await AdminReportSettings.findOneAndUpdate(
      { key: "default" },
      {
        $set: {
          enabled: Boolean(body.enabled),
          frequency,
          dayOfWeek,
          dayOfMonth,
          time,
          updatedBy: admin.email || admin.userId,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();

    return NextResponse.json({ settings });
  } catch (error) {
    if (!error.statusCode) console.error("[admin-report] settings PUT:", error.message);
    return errorResponse(error);
  }
}
