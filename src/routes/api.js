// src/routes/api.js
import express from "express";
import { z } from "zod";
import { encryptData, decryptData } from "../crypto/engine.js";
import Job from "../models/job.js";


const router = express.Router();

// ✅ Correct validation schema
const EncryptSchema = z.object({
  text: z.string().min(1, "Text is required"),
  algorithm: z.string().default("AES-GCM"),
});

const DecryptSchema = z.object({
  ciphertext: z.string(),
  key: z.string(),
  iv: z.string(),
  tag: z.string(),
});

router.post("/encrypt", async (req, res) => {
  try {
    // ✅ Extract fields correctly
    const { text, algorithm } = EncryptSchema.parse(req.body);

    // Perform encryption
    const result = encryptData(text, algorithm);

    // Optional: store metadata
    await Job.create({
      scheme: result.algorithm,
      timestamp: new Date(),
      length: result.ciphertext.length,
    });

    // ✅ Respond to client
    res.json({
      ok: true,
      message: "Encryption successful",
      ...result,
    });
  } catch (err) {
    console.error("Encryption error:", err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.post("/decrypt", async (req, res) => {
  try {
    const { ciphertext, key, iv, tag } = DecryptSchema.parse(req.body);
    const plainText = decryptData(ciphertext, key, iv, tag);
    res.json({ ok: true, message: "Decryption successful", plainText });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
