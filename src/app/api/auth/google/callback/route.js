import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import { signToken } from "@/app/lib/jwt";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login`
    );

  // Exchange code for token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = await tokenRes.json();

  // Get user info
  const userInfo = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  ).then((r) => r.json());

  await connectDB();
  let user = await User.findOne({ email: userInfo.email });
  if (!user) {
    user = await User.create({
      email: userInfo.email,
      googleId: userInfo.id,
    });
  }

  const jwt = signToken(user);
  const res = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/disclaimer`
  );
  res.cookies.set("token", jwt, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
