// api/agreement/sign-and-store/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import crypto from "crypto";
import { requireAuth } from "@/app/lib/authServer";

export async function POST(req) {
  try {
    // ✅ SECURITY: Require authentication to sign agreements
    const user = await requireAuth();

    await connectDB();
    const {
      agreementHtml,
      userId,
      clientName,
      clientPan,
      clientPhone,
      clientDob,
      clientState,
      signedPlanName,
      signedPlanId,
      signedPlanType,
      signedPlanDuration,
      signatureData,
      signedName,
      signedTimestamp,
      signatureTab,
      clientEmail,
    } = await req.json();

    // Debug log
    console.log("📥 Received signing payload:", {
      agreementHtml: agreementHtml
        ? `✅ present (${agreementHtml.length} chars)`
        : "❌ MISSING - THIS IS THE BUG!",
      userId,
      clientName,
      clientPan,
      clientPhone,
      clientDob,
      clientState,
      signatureData: signatureData ? "✅ present" : "❌ missing",
      signedName,
      signedTimestamp,
      signatureTab,
    });

    // WARN if agreement HTML is missing
    if (!agreementHtml || agreementHtml.length === 0) {
      console.warn(
        "⚠️⚠️⚠️ WARNING: Agreement HTML is missing or empty! The agreement content was not captured.",
      );
    }

    // Validate required fields - userId and signatureData are mandatory
    if (!userId || !signatureData) {
      console.error("Validation failed - missing required fields:", {
        userId: !userId ? "MISSING" : "OK",
        signatureData: !signatureData ? "MISSING" : "OK",
      });
      return NextResponse.json(
        { message: "Missing required signing information" },
        { status: 400 },
      );
    }

    // ✅ SECURITY: Verify user owns the agreement being signed (prevent IDOR)
    if (userId !== user.userId) {
      console.error("Unauthorized attempt to sign agreement for different user:", {
        requestedUserId: userId,
        authenticatedUserId: user.userId,
      });
      return NextResponse.json(
        { message: "Forbidden: Cannot sign agreements for other users" },
        { status: 403 },
      );
    }

    // Note: clientName and clientPan come with defaults from frontend if missing
    console.log("Signing with:", {
      userId,
      clientName: clientName || "Unknown",
      clientPan: clientPan || "NOT_PROVIDED",
    });

    // Check if agreement already signed by this user (for production, allow re-signing in dev)
    const existingAgreement = await SignedAgreement.findOne({
      userId,
      status: "SIGNED",
    });

    // Allow re-signing for development - comment out for production
    if (existingAgreement) {
      console.log(
        "User has existing signed agreement. Allowing re-signing for dev.",
      );
      // Uncomment below to prevent re-signing in production
      // return NextResponse.json(
      //   { message: "Agreement already signed by this user" },
      //   { status: 400 },
      // );
    }

    // Calculate file hash (SHA-256 of HTML + signature)
    const hashInput = `${agreementHtml}${signatureData}${signedTimestamp}`;
    const fileHash = crypto
      .createHash("sha256")
      .update(hashInput)
      .digest("hex");

    // Get IP address from request
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Prepare agreement data
    const agreementData = {
      userId,
      clientName,
      clientPan,
      clientPhone,
      clientDob,
      clientState,
      signedPlanName,
      signedPlanId,
      signedPlanType,
      signedPlanDuration,
      agreementHtml,
      signatureData,
      signedName,
      signedTimestamp,
      signatureTab,
      ipAddress,
      fileHash,
      status: "SIGNED",
      updatedAt: new Date(),
      clientEmail,
    };

    // If agreement already exists, update it; otherwise create new
    let savedAgreement;
    if (existingAgreement) {
      console.log(
        "Updating existing signed agreement for re-signing in dev mode.",
      );
      savedAgreement = await SignedAgreement.findOneAndUpdate(
        { userId, status: "SIGNED" },
        agreementData,
        { new: true },
      );
    } else {
      console.log("Creating new signed agreement.");
      const agreementDoc = new SignedAgreement({
        ...agreementData,
        createdAt: new Date(),
      });
      savedAgreement = await agreementDoc.save();
    }

    // Return file ID for secure download
    return NextResponse.json(
      {
        message: "Agreement signed and stored successfully",
        fileId: savedAgreement._id.toString(),
        agreementId: savedAgreement._id,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("SIGN AND STORE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to sign and store agreement", error: err.message },
      { status: 500 },
    );
  }
}
