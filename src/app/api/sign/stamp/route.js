import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import { verifyToken } from "@/app/lib/jwt";
import cloudinary from "@/app/lib/cloudinary";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });

    const user = verifyToken(token);

    const { pdfUrl, signatureUrl } = await req.json();
    if (!pdfUrl || !signatureUrl) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // load PDF
    const pdfBytes = await fetch(pdfUrl).then(r => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // load signature
    const sigBytes = await fetch(signatureUrl).then(r => r.arrayBuffer());
    const sigImg = await pdfDoc.embedPng(sigBytes);

    const pages = pdfDoc.getPages();
    const last = pages[pages.length - 1];
    const { width } = last.getSize();

    const sigWidth = 180;
    const sigHeight = 60;
    last.drawImage(sigImg, {
      x: width - sigWidth - 50,
      y: 60,
      width: sigWidth,
      height: sigHeight,
    });

    last.drawText(`Signed: ${new Date().toLocaleDateString()}`, {
      x: width - 200,
      y: 130,
      size: 10,
      color: rgb(0,0,0),
    });

    const signedBytes = await pdfDoc.save();
    const base64 = Buffer.from(signedBytes).toString("base64");

    const upload = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${base64}`,
      { folder: "signed-pdfs", resource_type: "raw" }
    );

    return NextResponse.json({ signedPdfUrl: upload.secure_url });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Stamp Failed" }, { status: 500 });
  }
}
