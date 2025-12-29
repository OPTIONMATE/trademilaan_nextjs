import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { verifyToken } from "@/app/lib/jwt";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ user: null }, { status: 401 });

  try {
    const decoded = verifyToken(token);
    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
