import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Document from "@/app/lib/models/Document";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    return NextResponse.redirect(doc.cloudinaryUrl);
  } catch (error) {
    return NextResponse.json({ message: "Failed to retrieve document" }, { status: 500 });
  }
}
