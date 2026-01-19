// ========== FIXED & ENHANCED API ROUTE: /api/sign/stamp ==========
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import cloudinary from "cloudinary";

// IMPORTANT: Cloudinary config (ensure these are set in env)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fetch any URL as buffer
async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch URL (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// Convert data URL → buffer + mime
function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL format");
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

export async function POST(req) {
  try {
    const { pdfUrl, signatureUrl } = await req.json();

    if (!pdfUrl || !signatureUrl) {
      return NextResponse.json(
        { error: "pdfUrl and signatureUrl are required" },
        { status: 400 }
      );
    }

    console.log(">>> Starting Stamp Workflow");

    // 1. Load PDF buffer
    const pdfBuffer = await fetchBuffer(pdfUrl);

    // 2. Resolve signature buffer
    let sigBuffer, sigMime;

    if (signatureUrl.startsWith("data:")) {
      const parsed = parseDataUrl(signatureUrl);
      sigBuffer = parsed.buffer;
      sigMime = parsed.mime;
    } else {
      sigBuffer = await fetchBuffer(signatureUrl);
      sigMime = signatureUrl.includes(".jpg") || signatureUrl.includes(".jpeg")
        ? "image/jpeg"
        : "image/png";
    }

    console.log("Signature MIME:", sigMime);

    // 3. Embed signature into PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    let sigImage;

    if (sigMime.includes("jpeg") || sigMime.includes("jpg")) {
      sigImage = await pdfDoc.embedJpg(sigBuffer);
    } else {
      sigImage = await pdfDoc.embedPng(sigBuffer);
    }

    const page = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Scale signature
    const width = pageWidth * 0.28;
    const scale = width / sigImage.width;
    const height = sigImage.height * scale;

    // Place bottom-right margin
    page.drawImage(sigImage, {
      x: pageWidth - width - 40,
      y: 40,
      width,
      height,
    });

    // 4. Save signed PDF
    const stampedBytes = await pdfDoc.save();
    const stampedBuffer = Buffer.from(stampedBytes);
    const filename = `signed-agreement-${Date.now()}.pdf`;

    // 5. Upload to Cloudinary as RAW PDF (THIS IS THE KEY FIX)
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "trademilaan/signed-agreements",
          resource_type: "raw",       // supports PDF
          format: "pdf",
          use_filename: true,
          unique_filename: false,
          filename_override: filename
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(stampedBuffer);
    });

    console.log("Cloudinary Upload:", {
      public_id: upload.public_id,
      secure_url: upload.secure_url
    });

    const finalPdfUrl = upload.secure_url + "#toolbar=1&navpanes=0&scrollbar=1";

    // 6. Response
    return NextResponse.json(
      {
        success: true,
        signedPdfUrl: finalPdfUrl,
        filename,
        publicId: upload.public_id
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("STAMP ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to stamp signature",
        detail: err.message,
        at: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
