import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";

import { generateInvoicePDF } from "@/app/lib/generateInvoicePDF";
import { sendInvoicePDFMail } from "@/app/lib/mailer";
import Payment from "@/app/lib/models/Payment";
import Coupon from "@/app/lib/models/Coupon";
import Plan from "@/app/lib/models/Plan";
import { verifyToken } from "@/app/lib/jwt";
import { cookies } from "next/headers";
import { createPerIpRateLimiter } from "@/app/lib/rateLimiter";
import { isValidEmail } from "@/app/lib/validators";

export async function POST(request) {
  // ✅ SECURITY: Rate limit payment verification (10 requests per minute per IP)
  const rateLimitCheck = createPerIpRateLimiter(request, 10, 60 * 1000);
  if (rateLimitCheck.limited) {
    return NextResponse.json(
      { error: `Too many payment requests. Try again in ${rateLimitCheck.retryAfter} seconds.` },
      { 
        status: 429,
        headers: { 'Retry-After': rateLimitCheck.retryAfter.toString() }
      }
    );
  }

  await connectDB();
  const body = await request.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name,
    email,
    phone,
    amount,
    couponCode,
    planId,
    planName,
    state,
    pan,
    panNumber,
  } = body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !name ||
    !email ||
    !phone
  ) {
    return NextResponse.json(
      { error: "Missing required payment fields" },
      { status: 400 },
    );
  }

  // ✅ SECURITY: Validate email format
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 },
    );
  }

  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid payment amount" },
      { status: 400 },
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Payment gateway is not configured" },
      { status: 500 },
    );
  }

  const Razorpay =
    (await import("razorpay")).default || (await import("razorpay"));
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
  } catch (err) {
    return NextResponse.json(
      { error: "Unable to validate payment order" },
      { status: 400 },
    );
  }

  const incomingAmountPaise = Math.round(safeAmount * 100);
  if (Number(razorpayOrder?.amount) !== incomingAmountPaise) {
    return NextResponse.json(
      { error: "Payment amount mismatch detected" },
      { status: 400 },
    );
  }

  const orderNoteFinalAmount = Number(razorpayOrder?.notes?.finalAmount || 0);
  if (
    orderNoteFinalAmount > 0 &&
    orderNoteFinalAmount !== Math.round(safeAmount)
  ) {
    return NextResponse.json(
      { error: "Payment metadata mismatch detected" },
      { status: 400 },
    );
  }

  const orderCouponCode = (razorpayOrder?.notes?.couponCode || "")
    .trim()
    .toUpperCase();
  const payloadCouponCode = (couponCode || "").trim().toUpperCase();
  if (orderCouponCode !== payloadCouponCode) {
    return NextResponse.json(
      { error: "Coupon mismatch detected" },
      { status: 400 },
    );
  }

  const orderPlanId = String(razorpayOrder?.notes?.planId || "").trim();
  const payloadPlanId = String(planId || "").trim();
  if (!orderPlanId || !payloadPlanId || orderPlanId !== payloadPlanId) {
    return NextResponse.json(
      { error: "Plan ID mismatch detected" },
      { status: 400 },
    );
  }

  const orderPlanName = String(razorpayOrder?.notes?.planName || "").trim();
  const payloadPlanName = String(planName || "").trim();
  if (!orderPlanName || !payloadPlanName || orderPlanName !== payloadPlanName) {
    return NextResponse.json(
      { error: "Plan name mismatch detected" },
      { status: 400 },
    );
  }

  const orderPlanType = String(razorpayOrder?.notes?.planType || "").trim();

  const crypto = (await import("crypto")).default || (await import("crypto"));
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");
  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Store payment in MongoDB
  try {
    let decodedAuth = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        decodedAuth = verifyToken(token);
      }
    } catch {
      decodedAuth = null;
    }

    const normalizedEmail = String(
      decodedAuth?.email || email || ""
    )
      .trim()
      .toLowerCase();
    const normalizedPlanId = String(orderPlanId || "").trim();

    // Final guard against duplicate active subscriptions for the same plan.
    // This prevents duplicates even if multiple checkouts are attempted quickly.
    const existingActiveSubscription = await Payment.findOne({
      email: normalizedEmail,
      planId: normalizedPlanId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ expiresAt: -1 })
      .lean();

    if (existingActiveSubscription) {
      return NextResponse.json(
        {
          error:
            "You already have an active subscription for this plan. Please renew after expiry.",
          code: "ACTIVE_SUBSCRIPTION_EXISTS",
          activeUntil: existingActiveSubscription.expiresAt,
        },
        { status: 409 },
      );
    }

    const normalizedPlanType = String(orderPlanType || "").trim().toLowerCase();
    const selectedPlan = await Plan.findById(orderPlanId).select("duration").lean();
    const resolvedPlanDurationDays =
      Number.isInteger(Number(selectedPlan?.duration)) &&
      Number(selectedPlan.duration) > 0
        ? Number(selectedPlan.duration)
        : normalizedPlanType === "weekly"
          ? 7
          : normalizedPlanType === "quarterly"
            ? 90
            : normalizedPlanType === "halfyearly"
              ? 182
              : normalizedPlanType === "yearly"
                ? 365
                : 30;

    // Set paidAt to now, expiresAt from selected plan duration
    const paidAt = new Date();
    const expiresAt = new Date(paidAt);
    expiresAt.setDate(expiresAt.getDate() + resolvedPlanDurationDays);

    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId: decodedAuth?.id ? String(decodedAuth.id) : null,
      planId: orderPlanId,
      planName: orderPlanName,
      planType: orderPlanType || null,
      name,
      email: normalizedEmail,
      phone,
      amount: safeAmount,
      paidAt,
      expiresAt,
      ...(couponCode && { couponCode }),
    });
    await payment.save();

    // ✅ Mark coupon as used (increment usedCount)
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
        { new: true },
      );
    }

    // Save invoice to Invoice collection for admin dashboard
    const mongoose = (await import("mongoose")).default;
    const InvoiceSchema = new mongoose.Schema({
      clientName: String,
      amount: Number,
      startDate: Date,
      endDate: Date,
      createdAt: { type: Date, default: Date.now },
      email: String,
      phone: String,
      state: String,
      pan: String,
      planId: String,
      planName: String,
      razorpay_payment_id: String,
    });
    const Invoice =
      mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

    // Create invoice record with 1 month validity
    const invoiceStartDate = new Date();
    const invoiceEndDate = new Date(invoiceStartDate);
    invoiceEndDate.setMonth(invoiceEndDate.getMonth() + 1);

    await Invoice.create({
      clientName: name,
      amount: safeAmount,
      startDate: invoiceStartDate,
      endDate: invoiceEndDate,
      email: normalizedEmail,
      phone,
      state: state || "",
      pan: pan || panNumber || "",
      planId: orderPlanId,
      planName: orderPlanName,
      razorpay_payment_id,
    });

    // Generate invoice PDF (in memory, not saved to disk)
    const invoiceData = {
      clientName: name,
      email,
      mobile: phone,
      state: state || "",
      pan: pan || panNumber || "",
      planName: planName || "",
      price: `Rs. ${Math.round(safeAmount / 1.18)}`,
      gst: `Rs. ${safeAmount - Math.round(safeAmount / 1.18)}`,
      subtotal: `Rs. ${Math.round(safeAmount / 1.18)}`,
      total: `Rs. ${safeAmount}`,
    };
    const invoicePDFBuffer = await generateInvoicePDF(invoiceData);

    // Send invoice email to user
    await sendInvoicePDFMail({
      to: normalizedEmail,
      pdfBuffer: invoicePDFBuffer,
      clientName: name,
      email: normalizedEmail,
      phone,
      planName: orderPlanName,
      amount: safeAmount,
      clientPan: pan || panNumber || "",
    });

    return NextResponse.json({
      success: true,
      razorpay_payment_id,
      planId: orderPlanId,
      planName: orderPlanName,
      planType: orderPlanType || null,
      name,
      email,
      phone,
      amount: safeAmount,
      ...(couponCode && { couponCode }),
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      {
        error: "Failed to save payment or send invoice",
        details: err.message,
      },
      { status: 500 },
    );
  }
}
