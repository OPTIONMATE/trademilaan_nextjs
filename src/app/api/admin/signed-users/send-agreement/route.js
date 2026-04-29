import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import User from "@/app/lib/models/User";
import Payment from "@/app/lib/models/Payment";
import { generateCompleteAgreementPDF } from "@/app/lib/generateCompletePDF";
import { sendAgreementPDFMail } from "@/app/lib/mailer";
import { requireAdmin } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";

export async function POST(req) {
  try {
    // Admin only
    await requireAdmin();

    const body = await req.json();
    const { agreementId } = body || {};

    if (!agreementId) {
      return NextResponse.json({ error: "agreementId is required" }, { status: 400 });
    }

    if (!isValidObjectId(agreementId)) {
      return NextResponse.json({ error: "Invalid agreementId" }, { status: 400 });
    }

    await connectDB();

    const agreement = await SignedAgreement.findById(agreementId).lean();
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (agreement.status !== "SIGNED") {
      return NextResponse.json({ error: "Agreement is not signed" }, { status: 400 });
    }

    // Find related payment to compute plan dates
    const paymentQuery = { userId: String(agreement.userId || "") };
    if (agreement.signedPlanName) paymentQuery.planName = agreement.signedPlanName;

    const relatedPayment = await Payment.findOne(paymentQuery).sort({ paidAt: -1, createdAt: -1 }).lean();

    const planStartDate = relatedPayment?.paidAt || agreement.signedTimestamp || new Date();
    const planEndDate = relatedPayment?.expiresAt || undefined;
    const planType = relatedPayment?.planType || agreement.signedPlanType || "monthly";
    const planDuration = planEndDate && planStartDate
      ? Math.max(1, Math.ceil((new Date(planEndDate).getTime() - new Date(planStartDate).getTime()) / (24 * 60 * 60 * 1000)))
      : agreement.signedPlanDuration || undefined;

    const effectivePlanEndDate = planEndDate || (planStartDate && planDuration ? new Date(new Date(planStartDate).getTime() + Number(planDuration) * 24 * 60 * 60 * 1000) : undefined);

    // Generate PDF buffer
    const pdfBuffer = await generateCompleteAgreementPDF({
      ...agreement,
      _id: agreement._id.toString(),
      signedDate: agreement.signedTimestamp ? new Date(agreement.signedTimestamp).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
      planType,
      planStartDate,
      planEndDate: effectivePlanEndDate,
      planDuration,
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }

    // Determine recipient email
    let recipientEmail = agreement.clientEmail;
    let user = null;
    if (!recipientEmail && agreement.userId) {
      user = await User.findById(agreement.userId).lean();
      recipientEmail = user?.email || null;
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email found for this agreement" }, { status: 400 });
    }

    // Send email to user and CC to spkumar
    await sendAgreementPDFMail({
      to: recipientEmail,
      pdfBuffer,
      clientName: agreement.clientName || (user && user.fullName) || "User",
      clientPan: agreement.clientPan || (user && user.panNumber) || "",
    });

    // Mark user's flag as mailed
    if (!user && agreement.userId) {
      user = await User.findById(agreement.userId);
    }
    if (user) {
      user.agreementMailedToUser = true;
      user.agreementMailedAt = new Date();
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Agreement mailed" });
  } catch (err) {
    console.error("Send agreement error:", err);
    return NextResponse.json({ error: err.message || "Failed to send agreement" }, { status: 500 });
  }
}
