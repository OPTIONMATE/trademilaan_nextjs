import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { transporter } from "@/app/lib/mailer";

export async function POST(req) {
  const { fullName, dob, gender, state, email, panNumber } = await req.json();

  // 1. Basic validation
  if (!fullName || !dob || !gender || !state || !email || !panNumber) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // 2. PAN format validation
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panNumber)) {
    return NextResponse.json(
      { message: "Invalid PAN format" },
      { status: 400 }
    );
  }

  // 3. Get logged-in user from cookie
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(decoded.id);

  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // 4. Save details & generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.fullName = fullName;
  user.dob = dob;
  user.gender = gender;
  user.state = state;
  // Normalize email
  const normalizedEmail = String(email).trim().toLowerCase();
  // Only update email if it changes and isn't used by another account
  if (normalizedEmail !== (user.email || "").toLowerCase()) {
    const existing = await User.exists({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existing) {
      return NextResponse.json(
        { message: "Email already in use by another account" },
        { status: 409 }
      );
    }
    user.email = normalizedEmail;
  }
  user.panNumber = panNumber;
  user.emailOtp = otp;
  user.emailOtpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await user.save();

  // 5. Send OTP email
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: user.email,
    subject: "TradeMilaan – Email Verification OTP",
    html: `<p>Your OTP is <b>${otp}</b>. Valid for 5 minutes.</p>`,
  });

  return NextResponse.json({ message: "OTP sent!" });
}
