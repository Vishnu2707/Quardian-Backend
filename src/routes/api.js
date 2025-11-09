// src/routes/api.js
import express from "express";
import { z } from "zod";
import { encryptData, decryptData, signMessage, verifySignature } from "../crypto/engine.js";
import Job from "../models/job.js";

const router = express.Router();

// ========== Schemas ==========
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

const SignSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const VerifySchema = z.object({
  message: z.string().min(1),
  publicKey: z.string().min(1),
  signature: z.string().min(1),
});

// ========== Encrypt ==========
router.post("/encrypt", async (req, res) => {
  try {
    const { text, algorithm } = EncryptSchema.parse(req.body);
    const result = encryptData(text, algorithm);

    await Job.create({
      kind: "encrypt",
      scheme: algorithm,
      timestamp: new Date(),
      length: result.ciphertext.length,
    });

    res.json({ ok: true, message: "Encryption successful", ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ========== Decrypt ==========
router.post("/decrypt", async (req, res) => {
  try {
    const { ciphertext, key, iv, tag } = DecryptSchema.parse(req.body);
    const plainText = decryptData(ciphertext, key, iv, tag);

    await Job.create({
      kind: "decrypt",
      scheme: "AES-GCM",
      timestamp: new Date(),
      length: plainText.length,
    });

    res.json({ ok: true, message: "Decryption successful", plainText });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ========== Sign (demo PQC placeholder) ==========
router.post("/sign", async (req, res) => {
  try {
    const { message } = SignSchema.parse(req.body);
    const result = signMessage(message);

    await Job.create({
      kind: "sign",
      scheme: "Ed25519-demo",
      timestamp: new Date(),
      length: message.length,
    });

    res.json({ ok: true, message: "Signature generated", ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ========== Verify (demo PQC placeholder) ==========
router.post("/verify", async (req, res) => {
  try {
    const { message, publicKey, signature } = VerifySchema.parse(req.body);
    const valid = verifySignature(message, publicKey, signature);

    await Job.create({
      kind: "verify",
      scheme: "Ed25519-demo",
      timestamp: new Date(),
      result: valid,
    });

    res.json({ ok: true, message: "Verification completed", valid });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
