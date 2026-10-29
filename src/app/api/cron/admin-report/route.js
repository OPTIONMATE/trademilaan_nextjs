import crypto from "crypto";
import { NextResponse } from "next/server";
import { runAdminReport } from "@/app/lib/adminReport/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called hourly by GitHub Actions and daily by Vercel Cron (fallback).
// Authenticated only by CRON_SECRET; the report itself decides whether it is
// due, so extra calls are harmless (they return "skipped").
function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAdminReport({ trigger: "cron", triggeredBy: "scheduler" });
    // Only status info is returned; report data is never exposed here.
    return NextResponse.json(
      { status: result.status, reason: result.reason || result.error || null, periodKey: result.periodKey || null },
      { status: result.status === "failed" ? 500 : 200 },
    );
  } catch (error) {
    console.error("[admin-report] cron error:", error?.message || error);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
