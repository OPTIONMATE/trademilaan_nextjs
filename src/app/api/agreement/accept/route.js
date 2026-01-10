import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function POST(req) {
  await connectDB();
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await User.findByIdAndUpdate(userId, {
    pdfAccepted: true,
    pdfAcceptedAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
