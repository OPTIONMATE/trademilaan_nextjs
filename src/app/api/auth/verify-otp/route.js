import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { signToken } from "@/app/lib/jwt";
import { serializeAuthUser } from "@/app/lib/serializers";
import { setSecureCookie } from "@/app/lib/apiHelpers";
import { isValidEmail, isValidOTP, incrementOTPAttempt, isOTPBlocked, resetOTPAttempts } from "@/app/lib/validators";

// Step 2 of registration: verify OTP, mark user verified, log them in.
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    // Input validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!isValidOTP(otp)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Rate limit OTP attempts (prevents brute-forcing)
    if (isOTPBlocked(normalizedEmail)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    await connectDB();

    // Find the unverified user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: "No pending registration found for this email" },
        { status: 400 }
      );
    }

    // Already verified — nothing to do
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified. Please login." },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (!user.emailOtpExpiry || new Date() > user.emailOtpExpiry) {
      return NextResponse.json(
        { error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpMatches = await bcrypt.compare(otp, user.emailOtp);
    if (!otpMatches) {
      incrementOTPAttempt(normalizedEmail);
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // OTP verified — mark user as verified and clear OTP fields
    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Reset OTP attempt counter
    resetOTPAttempts(normalizedEmail);

    // Generate auth token
    const token = signToken(user);

    // Return safe user data
    const res = NextResponse.json({
      user: serializeAuthUser(user),
    });

    // Set secure cookie
    setSecureCookie(res, "token", token);
    return res;
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}