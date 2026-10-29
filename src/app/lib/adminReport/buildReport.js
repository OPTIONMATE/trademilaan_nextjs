import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Payment from "@/app/lib/models/Payment";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import Invoice from "@/app/lib/models/Invoice";
import ContactMessage from "@/app/lib/models/ContactMessage";
import { getPreviousPeriod } from "./schedule";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_DAYS = 7;
const OPEN_COMPLAINT_STATUSES = ["pending", "in_progress"];

const norm = (email) => String(email || "").trim().toLowerCase();
const inRange = (value, { start, end }) => {
  if (!value) return false;
  const t = new Date(value).getTime();
  return t >= start.getTime() && t < end.getTime();
};
// Same GST split used by invoices (amount is GST-inclusive, 18%).
const splitGst = (amount) => {
  const total = Number(amount) || 0;
  const base = Math.round(total / 1.18);
  return { base, gst: total - base, total };
};

function subscriptionStatus(expiresAt, now) {
  if (!expiresAt) return { status: "Unknown", daysRemaining: null };
  const msLeft = new Date(expiresAt).getTime() - now.getTime();
  if (msLeft <= 0) return { status: "Expired", daysRemaining: 0 };
  const daysRemaining = Math.ceil(msLeft / DAY_MS);
  return {
    status: daysRemaining <= EXPIRING_DAYS ? "Expiring soon" : "Active",
    daysRemaining,
  };
}

// Index helpers: latest item per key.
function latestBy(items, keyFn, dateFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    const prev = map.get(key);
    if (!prev || new Date(dateFn(item)) > new Date(dateFn(prev))) map.set(key, item);
  }
  return map;
}

/**
 * Collects everything the admin report needs for `period` ({ start, end }).
 * Read-only; returns plain objects (no Mongoose documents).
 */
export async function buildAdminReport(period, now = new Date()) {
  await connectDB();
  const previous = getPreviousPeriod(period);

  const [users, payments, agreements, invoices, messages] = await Promise.all([
    User.find({})
      .select(
        "username fullName email phone panNumber panVerified dob gender state role authProvider emailVerified lastLoginAt createdAt riskProfile agreementMailedToUser agreementMailedAt invoiceMailedToUser invoiceMailedAt",
      )
      .lean(),
    Payment.find({})
      .select(
        "razorpay_order_id razorpay_payment_id userId planId planName planType planDuration name email phone amount couponCode paidAt expiresAt createdAt",
      )
      .lean(),
    SignedAgreement.find({ status: { $ne: "DRAFT" } })
      .select(
        "userId clientName clientEmail clientPan clientPhone signedPlanName signedPlanType signedTimestamp ipAddress status downloadCount agreementMailedToUser agreementMailedAt",
      )
      .lean(),
    Invoice.find({}).lean(),
    ContactMessage.find({})
      .select("referenceId name email phone subject status priority assignedTo createdAt")
      .lean(),
  ]);

  const userById = new Map(users.map((u) => [String(u._id), u]));
  const userByEmail = new Map(users.map((u) => [norm(u.email), u]));
  const findUser = (userId, email) =>
    (userId && userById.get(String(userId))) || userByEmail.get(norm(email)) || null;

  const agreementByUserId = latestBy(agreements, (a) => a.userId && String(a.userId), (a) => a.signedTimestamp);
  const agreementByEmail = latestBy(agreements, (a) => norm(a.clientEmail), (a) => a.signedTimestamp);
  const invoiceByPaymentId = new Map(invoices.map((i) => [i.razorpay_payment_id, i]));

  const complaintsByEmail = new Map();
  for (const msg of messages) {
    const key = norm(msg.email);
    if (!key) continue;
    const entry = complaintsByEmail.get(key) || { total: 0, open: 0 };
    entry.total += 1;
    if (OPEN_COMPLAINT_STATUSES.includes(msg.status)) entry.open += 1;
    complaintsByEmail.set(key, entry);
  }

  // ---- Clients master: one row per paying client (latest payment) ----
  const paymentsByClient = new Map();
  for (const p of payments) {
    const user = findUser(p.userId, p.email);
    const key = user ? String(user._id) : norm(p.email);
    const list = paymentsByClient.get(key) || [];
    list.push(p);
    paymentsByClient.set(key, list);
  }

  const clients = [];
  for (const list of paymentsByClient.values()) {
    list.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    const latest = list[0];
    const user = findUser(latest.userId, latest.email);
    const email = user?.email || latest.email;
    const agreement =
      (user && agreementByUserId.get(String(user._id))) || agreementByEmail.get(norm(email)) || null;
    const invoice = invoiceByPaymentId.get(latest.razorpay_payment_id) || null;
    const complaints = complaintsByEmail.get(norm(email)) || { total: 0, open: 0 };
    const { status, daysRemaining } = subscriptionStatus(latest.expiresAt, now);
    const totalPaid = list.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    clients.push({
      name: user?.fullName || latest.name || user?.username || "",
      email,
      phone: user?.phone || latest.phone || "",
      pan: user?.panNumber || agreement?.clientPan || invoice?.pan || "",
      dob: user?.dob || "",
      gender: user?.gender || "",
      state: user?.state || invoice?.state || "",
      signupDate: user?.createdAt || null,
      lastLogin: user?.lastLoginAt || null,
      planName: latest.planName || "",
      planType: latest.planType || "",
      planDuration: latest.planDuration || null,
      amount: Number(latest.amount) || 0,
      coupon: latest.couponCode || "",
      paidAt: latest.paidAt,
      validFrom: invoice?.startDate || latest.paidAt,
      validTo: latest.expiresAt,
      daysRemaining,
      status,
      purchases: list.length,
      totalPaid,
      agreementSignedAt: agreement?.signedTimestamp || null,
      agreementMailed: Boolean(agreement?.agreementMailedToUser || user?.agreementMailedToUser),
      invoiceNo: latest.razorpay_payment_id,
      invoiceMailed: Boolean(user?.invoiceMailedToUser),
      complaintsTotal: complaints.total,
      complaintsOpen: complaints.open,
      riskProfileDone: Boolean(user?.riskProfile && Object.values(user.riskProfile).some(Boolean)),
    });
  }
  clients.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  // ---- Period activity ----
  const paymentRow = (p) => {
    const user = findUser(p.userId, p.email);
    const invoice = invoiceByPaymentId.get(p.razorpay_payment_id);
    return {
      paidAt: p.paidAt,
      name: user?.fullName || p.name || "",
      email: p.email,
      phone: p.phone || user?.phone || "",
      pan: user?.panNumber || invoice?.pan || "",
      planName: p.planName || "",
      ...splitGst(p.amount),
      coupon: p.couponCode || "",
      paymentId: p.razorpay_payment_id,
      orderId: p.razorpay_order_id,
      validFrom: invoice?.startDate || p.paidAt,
      validTo: p.expiresAt,
    };
  };
  const periodPayments = payments
    .filter((p) => inRange(p.paidAt, period))
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
    .map(paymentRow);
  const previousPayments = payments.filter((p) => inRange(p.paidAt, previous));

  const periodAgreements = agreements
    .filter((a) => inRange(a.signedTimestamp, period))
    .sort((a, b) => new Date(b.signedTimestamp) - new Date(a.signedTimestamp))
    .map((a) => ({
      signedAt: a.signedTimestamp,
      name: a.clientName || "",
      email: a.clientEmail || "",
      phone: a.clientPhone || "",
      pan: a.clientPan || "",
      planName: a.signedPlanName || "",
      planType: a.signedPlanType || "",
      ipAddress: a.ipAddress || "",
      status: a.status,
      mailed: Boolean(a.agreementMailedToUser),
      mailedAt: a.agreementMailedAt || null,
      downloads: a.downloadCount || 0,
    }));

  const periodInvoices = invoices
    .filter((i) => inRange(i.createdAt, period))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((i) => ({
      date: i.createdAt,
      name: i.clientName || "",
      email: i.email || "",
      pan: i.pan || "",
      planName: i.planName || "",
      ...splitGst(i.amount),
      validFrom: i.startDate,
      validTo: i.endDate,
      paymentId: i.razorpay_payment_id || "",
      mailed: Boolean(userByEmail.get(norm(i.email))?.invoiceMailedToUser),
    }));

  const expiring = clients.filter(
    (c) => c.status === "Expiring soon" || (c.status === "Expired" && inRange(c.validTo, period)),
  );

  const paidKeys = new Set(payments.flatMap((p) => [p.userId && String(p.userId), norm(p.email)]).filter(Boolean));
  const newUsers = users
    .filter((u) => u.role !== "admin" && inRange(u.createdAt, period))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((u) => ({
      createdAt: u.createdAt,
      name: u.fullName || u.username || "",
      email: u.email || "",
      phone: u.phone || "",
      provider: u.authProvider || "email",
      emailVerified: Boolean(u.emailVerified),
      pan: u.panNumber || "",
      hasPaid: paidKeys.has(String(u._id)) || paidKeys.has(norm(u.email)),
    }));

  const complaints = messages
    .filter((m) => inRange(m.createdAt, period) || OPEN_COMPLAINT_STATUSES.includes(m.status))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((m) => ({
      referenceId: m.referenceId || "",
      createdAt: m.createdAt,
      name: m.name || "",
      email: m.email || "",
      phone: m.phone || "",
      subject: m.subject || "",
      status: m.status,
      priority: m.priority,
      assignedTo: m.assignedTo || "",
      ageDays: Math.floor((now.getTime() - new Date(m.createdAt).getTime()) / DAY_MS),
      inPeriod: inRange(m.createdAt, period),
    }));

  // ---- Summary ----
  const sum = (rows, key) => rows.reduce((total, r) => total + (Number(r[key]) || 0), 0);
  const previousRevenue = previousPayments.reduce((t, p) => t + (Number(p.amount) || 0), 0);
  const summary = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "Active" || c.status === "Expiring soon").length,
    expiringSoon: clients.filter((c) => c.status === "Expiring soon").length,
    expiredClients: clients.filter((c) => c.status === "Expired").length,
    totalUsers: users.filter((u) => u.role !== "admin").length,
    newUsers: newUsers.length,
    paymentsCount: periodPayments.length,
    previousPaymentsCount: previousPayments.length,
    revenueBase: sum(periodPayments, "base"),
    revenueGst: sum(periodPayments, "gst"),
    revenueTotal: sum(periodPayments, "total"),
    previousRevenueTotal: previousRevenue,
    agreementsSigned: periodAgreements.length,
    invoicesIssued: periodInvoices.length,
    complaintsReceived: complaints.filter((c) => c.inPeriod).length,
    complaintsOpen: messages.filter((m) => OPEN_COMPLAINT_STATUSES.includes(m.status)).length,
    agreementsNotMailed: clients.filter((c) => c.status !== "Expired" && c.agreementSignedAt && !c.agreementMailed).length,
    clientsWithoutAgreement: clients.filter((c) => c.status !== "Expired" && !c.agreementSignedAt).length,
    invoicesNotMailed: clients.filter((c) => c.status !== "Expired" && !c.invoiceMailed).length,
  };

  return {
    period,
    previous,
    generatedAt: now,
    summary,
    clients,
    payments: periodPayments,
    agreements: periodAgreements,
    invoices: periodInvoices,
    expiring,
    newUsers,
    complaints,
  };
}
