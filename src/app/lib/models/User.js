import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    googleId: { type: String },
    disclaimerAccepted: { type: Boolean, default: false },

    // NEW FIELDS
    fullName: { type: String },
    dob: { type: String },
    gender: { type: String },
    state: { type: String },
    panNumber: { type: String },
    panVerified: { type: Boolean, default: false },

    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
       // ⬇️ NEW FIELDS FOR PDF AGREEMENT
    pdfAccepted: { type: Boolean, default: false },
    pdfAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
