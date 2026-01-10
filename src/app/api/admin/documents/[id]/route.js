import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Document from "@/app/lib/models/Document";

// GET - Redirect to Cloudinary URL
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Redirect to Cloudinary secure URL
    return NextResponse.redirect(document.secureUrl);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}
