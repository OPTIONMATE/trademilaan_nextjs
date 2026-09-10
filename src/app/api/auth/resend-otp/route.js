import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { generateSecureOTP, isValidEmail } from "@/app/lib/validators";
import { sendOtpMail } from "@/app/lib/mailer";

// Resend OTP for pending registration (60s cooldown).
export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    await connectDB();

    const user = await User.findOne({ email: normalizedEmail });

    // Don't reveal whether email exists — same response either way
    if (!user) {
      return NextResponse.json({
        message: "If a pending registration exists, a new code has been sent",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "If a pending registration exists, a new code has been sent",
      });
    }

    // 60-second cooldown between resends
    const lastSent = user.emailOtpExpiry
      ? new Date(user.emailOtpExpiry.getTime() - 10 * 60 * 1000)
      : null;
    if (lastSent && Date.now() - lastSent.getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil(
        (60 * 1000 - (Date.now() - lastSent.getTime())) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitSeconds}s before requesting a new code`,
          cooldown: waitSeconds,
        },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateSecureOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailOtp = otpHash;
    user.emailOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP email — await so failures are reported
    try {
      await sendOtpMail({ to: normalizedEmail, otp, username: user.username });
    } catch (err) {
      console.error("OTP resend failed:", err.message);
      return NextResponse.json(
        { error: "Failed to resend verification email. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: "Verification code resent to your email",
      cooldown: 60,
    });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}