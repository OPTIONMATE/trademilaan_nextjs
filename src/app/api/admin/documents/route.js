import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Document from "@/app/lib/models/Document";
import Agreement from "@/app/lib/models/Agreement";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

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

// ================= GET ===================
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const documents = await Document.find()
      .select("filename size secureUrl cloudinaryPublicId cloudinaryUrl createdAt _id")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = documents.map((doc) => ({
      id: doc._id.toString(),
      filename: doc.filename,
      url: doc.secureUrl,
      size: formatFileSize(doc.size),
      uploadedAt: doc.createdAt,
    }));

    return NextResponse.json({ documents: formatted });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// ================= POST ===================
export async function POST(request) {
  try {
    const user = await requireAdmin();
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("document");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    const cloudinaryResult = await uploadToCloudinary(buffer, safeName);

    const document = await Document.create({
      filename: safeName,
      contentType: file.type,
      cloudinaryUrl: cloudinaryResult.downloadUrl,   // FIXED
      cloudinaryPublicId: cloudinaryResult.publicId,
      secureUrl: cloudinaryResult.secureUrl,
      size: cloudinaryResult.bytes,
      uploadedBy: user._id,
    });

    await Agreement.create({ fileUrl: cloudinaryResult.secureUrl });

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: document.filename,
      id: document._id,
      url: document.secureUrl,
      download: document.cloudinaryUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// ================= DELETE ===================
export async function DELETE(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Document ID is required" }, { status: 400 });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    try {
      await deleteFromCloudinary(doc.cloudinaryPublicId);
    } catch (cloudError) {
      console.error("Cloudinary deletion error:", cloudError);
    }

    await Document.findByIdAndDelete(id);

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
