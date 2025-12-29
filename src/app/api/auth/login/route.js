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

  const user = await User.findOne({ email });
  if (!user || !user.password)
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = signToken(user);

  const res = NextResponse.json({ user });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
