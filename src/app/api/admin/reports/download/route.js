import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";
import AdminReportLog from "@/app/lib/models/AdminReportLog";
import { generateReport, getReportSettings } from "@/app/lib/adminReport/run";
import { getRollingPeriod, getCustomPeriod } from "@/app/lib/adminReport/schedule";

export const maxDuration = 60;

// GET ?logId=<id>  -> re-generate the Excel for that past report's period
// GET ?range=day|week|month|last6|custom (&date|&month|&from&to)
//                  -> Excel for an admin-chosen period
// GET (no params)  -> Excel for the current period up to now
// Data is regenerated from the database, so it reflects current records for
// that period (e.g. complaint statuses as they are today).
export async function GET(req) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const logId = searchParams.get("logId");
    const range = searchParams.get("range");

    let period;
    if (logId) {
      if (!isValidObjectId(logId)) {
        return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
      }
      const log = await AdminReportLog.findById(logId).lean();
      if (!log) return NextResponse.json({ error: "Report not found" }, { status: 404 });
      period = { frequency: log.frequency, start: log.periodStart, end: log.periodEnd };
    } else if (range) {
      period = getCustomPeriod({
        range,
        date: searchParams.get("date"),
        month: searchParams.get("month"),
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      });
      if (!period) return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    } else {
      period = getRollingPeriod(await getReportSettings());
    }

    const { xlsxBuffer, fileName } = await generateReport(
      { ...period, start: new Date(period.start), end: new Date(period.end) },
    );

    return new NextResponse(xlsxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(xlsxBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (!error.statusCode) console.error("[admin-report] download:", error.message);
    return NextResponse.json(
      { error: error.statusCode ? error.message : "Something went wrong" },
      { status: error.statusCode || 500 },
    );
  }
}
