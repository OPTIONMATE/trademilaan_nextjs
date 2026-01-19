import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Agreement from "@/app/lib/models/Agreement";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // buffer conversion
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    // upload pdf
    const upload = await uploadToCloudinary(buffer, safeName, "trademilaan/agreements");

    if (!upload || !upload.secureUrl || !upload.publicId) {
      console.error("Cloudinary Upload Failed:", upload);
      return NextResponse.json({ message: "Cloudinary upload failed" }, { status: 500 });
    }

    // get last version
    const lastVersion = await Agreement.findOne().sort({ version: -1 });
    const newVersion = lastVersion && !isNaN(lastVersion.version)
      ? Number(lastVersion.version) + 1
      : 1;

    // save db
    const newAgreement = await Agreement.create({
      version: newVersion,
      pdfUrl: upload.secureUrl,
      cloudinaryPublicId: upload.publicId,
    });

    return NextResponse.json({
      message: "Agreement uploaded successfully",
      version: newAgreement.version,
      pdfUrl: newAgreement.pdfUrl,
    });

  } catch (err) {
    console.error("Agreement Upload Error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
