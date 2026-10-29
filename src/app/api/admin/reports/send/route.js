import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/authServer";
import { runAdminReport } from "@/app/lib/adminReport/run";

export const maxDuration = 60;

// POST { mode: "all" | "test" }
// all  -> send now to every configured recipient
// test -> send now only to the logged-in admin
export async function POST(req) {
  try {
    const admin = await requireAdmin();
    const { mode } = await req.json().catch(() => ({}));
    if (!["all", "test"].includes(mode)) {
      return NextResponse.json({ error: "mode must be 'all' or 'test'" }, { status: 400 });
    }
    if (mode === "test" && !admin.email) {
      return NextResponse.json({ error: "Your account has no email address" }, { status: 400 });
    }

    const result = await runAdminReport({
      trigger: mode === "test" ? "test" : "manual",
      onlyTo: mode === "test" ? admin.email : null,
      triggeredBy: admin.email || admin.userId,
    });

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error || "Report failed" }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (!error.statusCode) console.error("[admin-report] send:", error.message);
    return NextResponse.json(
      { error: error.statusCode ? error.message : "Something went wrong" },
      { status: error.statusCode || 500 },
    );
  }
}
