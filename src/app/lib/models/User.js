import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },

    email: { type: String, unique: true, sparse: true },

    password: { type: String },

    googleId: { type: String },

    disclaimerAccepted: { type: Boolean, default: false },

    // 🔽 BUY FLOW FIELDS
    panNumber: { type: String },
    panVerified: { type: Boolean, default: false },

    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
