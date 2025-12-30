import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    googleId: { type: String },
    disclaimerAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
