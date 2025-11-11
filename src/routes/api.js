// src/routes/api.js
import express from "express";
import { z } from "zod";
import os from "os";
import fetch from "node-fetch";
import { encryptData, decryptData, signMessage, verifySignature } from "../crypto/engine.js";
import Job from "../models/job.js";

// ✅ Import metrics
import {
  encryptCounter,
  decryptCounter,
  verifyCounter,
  signCounter,
  lastCipherLen,
} from "../metrics/metrics.js";

const router = express.Router();

// ==============================
// Validation Schemas
// ==============================
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

// ========================================================
// Encrypt
// ========================================================
router.post("/encrypt", async (req, res) => {
  const start = Date.now();
  try {
    const { text, algorithm } = EncryptSchema.parse(req.body);
    const result = encryptData(text, algorithm);

    encryptCounter.inc();
    lastCipherLen.set(Buffer.from(result.ciphertext, "base64").length);

    await Job.create({
      kind: "encrypt",
      scheme: algorithm,
      timestamp: new Date(),
      length: result.ciphertext.length,
    });

    // ✅ Record latency
    const duration = (Date.now() - start) / 1000;
    latencySamples.push(duration);

    res.json({ ok: true, message: "Encryption successful", ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ========================================================
// Decrypt
// ========================================================
router.post("/decrypt", async (req, res) => {
  const start = Date.now();
  try {
    const { ciphertext, key, iv, tag } = DecryptSchema.parse(req.body);
    const plainText = decryptData(ciphertext, key, iv, tag);

    decryptCounter.inc();

    await Job.create({
      kind: "decrypt",
      scheme: "AES-GCM",
      timestamp: new Date(),
      length: plainText.length,
    });

    // ✅ Record latency
    const duration = (Date.now() - start) / 1000;
    latencySamples.push(duration);

    res.json({ ok: true, message: "Decryption successful", plainText });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ========================================================
// Sign (demo PQC placeholder)
// ========================================================
router.post("/sign", async (req, res) => {
  try {
    const { message } = SignSchema.parse(req.body);
    const result = signMessage(message);

    signCounter.inc();

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

// ========================================================
// Verify (demo PQC placeholder)
// ========================================================
router.post("/verify", async (req, res) => {
  try {
    const { message, publicKey, signature } = VerifySchema.parse(req.body);
    const valid = verifySignature(message, publicKey, signature);

    verifyCounter.inc();

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

// ========================================================
// STATS (API Summary for Dashboard)
// ========================================================
router.get("/stats", async (_req, res) => {
  try {
    const encrypts = await Job.countDocuments({ kind: "encrypt" });
    const decrypts = await Job.countDocuments({ kind: "decrypt" });
    const verifies = await Job.countDocuments({ kind: "verify" });

    const uptimePercent = 99.9;
    const efficiency = encrypts / (encrypts + verifies || 1);

    res.json({
      ok: true,
      encrypts,
      decrypts,
      verifies,
      uptimePercent,
      efficiency,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ========================================================
// SYSTEM METRICS (CPU + Memory)
// ========================================================
router.get("/system", (_req, res) => {
  try {
    const freeMem = os.freemem() / 1024 / 1024;
    const totalMem = os.totalmem() / 1024 / 1024;
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0]; // 1-min average load

    res.json({
      ok: true,
      cpuLoad: cpuLoad.toFixed(2),
      memoryUsedMB: usedMem.toFixed(2),
      memoryTotalMB: totalMem.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ========================================================
// LATENCY METRICS (for p95 chart)
// ========================================================
let latencySamples = [];

router.get("/latency", (_req, res) => {
  if (!latencySamples.length) return res.json({ ok: true, p95: 0.05 });
  const sorted = latencySamples.slice().sort((a, b) => a - b);
  const p95 = sorted[Math.floor(0.95 * sorted.length)];
  res.json({ ok: true, p95 });
});

export default router;
