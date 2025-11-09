// src/models/job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  scheme: String,
  timestamp: Date,
  length: Number,
});

// Default export, not named
const Job = mongoose.model("Job", jobSchema);
export default Job;
