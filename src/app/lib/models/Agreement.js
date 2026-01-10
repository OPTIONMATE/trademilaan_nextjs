import mongoose from "mongoose";

const AgreementSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Agreement ||
  mongoose.model("Agreement", AgreementSchema);
