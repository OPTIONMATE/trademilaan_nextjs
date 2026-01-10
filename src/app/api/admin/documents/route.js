import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Document from "@/app/lib/models/Document";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    throw new Error("Unauthorized");
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new Error("Invalid token");
  }

  await connectDB();
  const user = await User.findById(decoded.id).select("role");

  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

// GET - List all documents
export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const documents = await Document.find()
      .select("filename size secureUrl cloudinaryPublicId createdAt _id")
      .sort({ createdAt: -1 })
      .lean();

    const formattedDocuments = documents.map((doc) => ({
      id: doc._id.toString(),
      filename: doc.filename,
      url: doc.secureUrl,
      size: formatFileSize(doc.size),
      uploadedAt: doc.createdAt,
    }));

    return NextResponse.json({ documents: formattedDocuments });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch documents" },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" || error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

// POST - Upload a document
export async function POST(request) {
  try {
    const user = await requireAdmin();
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("document");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!file.type || file.type !== "application/pdf") {
      return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, safeName);

    // Save document metadata to MongoDB
    const document = await Document.create({
      filename: safeName,
      contentType: file.type,
      cloudinaryUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.publicId,
      secureUrl: cloudinaryResult.secureUrl,
      size: cloudinaryResult.bytes,
      uploadedBy: user._id,
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: document.filename,
      id: document._id,
      url: document.secureUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to upload file" },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" || error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

// DELETE - Remove a document
export async function DELETE(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Document ID is required" }, { status: 400 });
    }

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(document.cloudinaryPublicId);
    } catch (cloudError) {
      console.error("Cloudinary deletion error:", cloudError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await Document.findByIdAndDelete(id);

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete document" },
      { status: error.message === "Unauthorized" || error.message === "Invalid token" || error.message === "Admin access required" ? 403 : 500 }
    );
  }
}
