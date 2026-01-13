// ========== FIXED API ROUTE: /api/sign/stamp ==========
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

async function fetchBuffer(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL format");
  const mime = match[1] || "image/png";
  const buffer = Buffer.from(match[2], "base64");
  return { mime, buffer };
}

export async function POST(req) {
  try {
    const { pdfUrl, signatureUrl } = await req.json();

    // Validation
    if (!pdfUrl || !signatureUrl) {
      return NextResponse.json(
        { error: "pdfUrl and signatureUrl are required" },
        { status: 400 }
      );
    }

    console.log("Processing signature stamp...", {
      pdfUrl: pdfUrl.substring(0, 50) + "...",
      signatureUrl: signatureUrl.substring(0, 50) + "...",
    });

    // Fetch source PDF
    const sourcePdfBuffer = await fetchBuffer(pdfUrl);

    // Resolve signature bytes
    let sigBuffer;
    let sigMime = "image/png";

    if (signatureUrl.startsWith("data:")) {
      const parsed = parseDataUrl(signatureUrl);
      sigBuffer = parsed.buffer;
      sigMime = parsed.mime;
    } else {
      sigBuffer = await fetchBuffer(signatureUrl);
      // Try to detect MIME type from URL or default to PNG
      sigMime = signatureUrl.includes("jpg") || signatureUrl.includes("jpeg")
        ? "image/jpeg"
        : "image/png";
    }

    console.log("Signature details:", {
      bufferSize: sigBuffer.length,
      mimeType: sigMime,
    });

    // Load PDF and embed signature
    const pdfDoc = await PDFDocument.load(sourcePdfBuffer);
    let sigImage;

    if (sigMime.includes("jpeg") || sigMime.includes("jpg")) {
      sigImage = await pdfDoc.embedJpg(sigBuffer);
    } else {
      sigImage = await pdfDoc.embedPng(sigBuffer);
    }

    // Get last page for signature placement
    const pageCount = pdfDoc.getPageCount();
    const page = pdfDoc.getPage(pageCount - 1);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Scale signature to ~28% page width, keep aspect ratio
    const targetWidth = pageWidth * 0.28;
    const scale = targetWidth / sigImage.width;
    const targetHeight = sigImage.height * scale;

    const margin = 40;
    const x = pageWidth - targetWidth - margin;
    const y = margin;

    console.log("Signature placement:", {
      x,
      y,
      width: targetWidth,
      height: targetHeight,
      pageWidth,
      pageHeight,
    });

    page.drawImage(sigImage, {
      x,
      y,
      width: targetWidth,
      height: targetHeight,
    });

    // Save PDF as bytes
    const signedPdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(signedPdfBytes);

    console.log("Signed PDF size:", pdfBuffer.length, "bytes");

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `signed-agreement-${timestamp}.pdf`;

    // Upload to Cloudinary
    const upload = await uploadToCloudinary(
      pdfBuffer,
      filename,
      "trademilaan/signed-agreements"
    );

    console.log("PDF Uploaded to Cloudinary:", {
      publicId: upload.publicId,
      url: upload.secureUrl,
      format: upload.format,
      resourceType: upload.resourceType,
    });

    // CRITICAL FIX: Return proper URL for PDF download
    const downloadUrl = upload.secureUrl || upload.url;

    return NextResponse.json(
      {
        success: true,
        signedPdfUrl: downloadUrl,
        publicId: upload.publicId,
        filename: filename,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Stamp error:", {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to stamp signature",
        detail: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}