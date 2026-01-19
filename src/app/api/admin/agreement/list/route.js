import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Agreement from "@/app/lib/models/Agreement";

export async function GET() {
  try {
    await connectDB();
    const agreements = await Agreement.find().sort({ version: -1 });

    return NextResponse.json({ agreements });
  } catch (error) {
    console.error("AGREEMENT LIST ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch agreements" }, { status: 500 });
  }
}
