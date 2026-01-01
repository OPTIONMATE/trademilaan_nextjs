import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { signToken } from "@/app/lib/jwt";
import { sendTermsAndConditionsMail } from "@/app/lib/mailer";

export async function POST(req) {
  console.log("SIGNUP API HIT");

  const body = await req.json();
  console.log("REQUEST BODY:", body);

  const { email, password, username } = body;

  if (!email || !password || !username) {
    console.error("MISSING FIELDS");
    return NextResponse.json(
      { message: "Missing fields" },
      { status: 400 }
    );
  }

  await connectDB();
  console.log("DB CONNECTED");

  const exists = await User.findOne({ email });
  if (exists) {
    console.error("USER ALREADY EXISTS:", email);
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, username });

  console.log("USER CREATED:", user._id.toString());

  // 🚀 Fire-and-forget mail (do NOT block signup)
  sendTermsAndConditionsMail(email).catch((err) => {
    console.error("TERMS MAIL ERROR (NON-BLOCKING)", err);
  });

  const token = signToken(user);

  const res = NextResponse.json({ user });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  console.log("SIGNUP COMPLETED SUCCESSFULLY");

  return res;
}
