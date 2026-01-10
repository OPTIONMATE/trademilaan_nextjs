import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Agreement from "@/app/lib/models/Agreement";

export async function GET() {
  await connectDB();
  const agreement = await Agreement.findOne().sort({ createdAt: -1 });

  if (!agreement) {
    return NextResponse.json({ fileUrl: null, message: "No PDF found" });
  }

  return NextResponse.json({ fileUrl: agreement.fileUrl });
}
