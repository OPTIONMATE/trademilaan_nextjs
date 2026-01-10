import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function POST(req) {
  const { otp } = await req.json();

  if (!otp) {
    return NextResponse.json(
      { message: "OTP is required" },
      { status: 400 }
    );
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(decoded.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (
    user.emailOtp !== otp ||
    !user.emailOtpExpiry ||
    user.emailOtpExpiry < new Date()
  ) {
    return NextResponse.json(
      { message: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  // ✅ OTP VERIFIED
  user.emailOtp = null;
  user.emailOtpExpiry = null;
  user.panVerified = true;

  await user.save();

  return NextResponse.json({
    message: "OTP verified successfully",
  });
}
