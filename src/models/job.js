import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["encrypt", "decrypt"], required: true },
    scheme: { type: String, default: "AES-GCM", index: true },
    payloadBytes: Number,
    resultBytes: Number
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
