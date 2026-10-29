import mongoose from "mongoose";

// Same shape as the inline Invoice schemas in payment/verify, payment/invoice
// and admin/invoices/download-pdf; `mongoose.models.Invoice ||` keeps them
// interchangeable whichever is compiled first.
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
  planType: String,
  planDuration: Number,
  razorpay_payment_id: String,
});

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", InvoiceSchema);
