import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { signToken } from "@/app/lib/jwt";

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });

  await connectDB();

  const exists = await User.findOne({ email });
  if (exists)
    return NextResponse.json({ message: "User already exists" }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });

  const token = signToken(user);

  const res = NextResponse.json({ user });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
