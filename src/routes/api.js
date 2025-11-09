import { Router } from "express";
import { z } from "zod";
import Job from "../models/Job.js";
import { encryptHybrid, decryptHybrid } from "../crypto/engine.js";

const r = Router();

/** POST /api/encrypt */
r.post("/encrypt", async (req, res) => {
  try {
    const body = z.object({
      data: z.string().min(1),
      scheme: z.string().default("AES-GCM") // UI may send Kyber/Dilithium later
    }).parse(req.body);

    const result = await encryptHybrid(body.data, body.scheme);

    // store only metadata
    await Job.create({
      type: "encrypt",
      scheme: body.scheme,
      payloadBytes: Buffer.byteLength(body.data, "utf8"),
      resultBytes: Buffer.byteLength(result.ciphertext, "base64")
    });

    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/** POST /api/decrypt */
r.post("/decrypt", async (req, res) => {
  try {
    const body = z.object({
      ciphertext: z.string(),
      iv: z.string(),
      tag: z.string(),
      key: z.string()
    }).parse(req.body);

    const plaintext = await decryptHybrid(body);

    await Job.create({
      type: "decrypt",
      scheme: "AES-GCM",
      payloadBytes: Buffer.byteLength(body.ciphertext, "base64"),
      resultBytes: Buffer.byteLength(plaintext, "utf8")
    });

    res.json({ ok: true, plaintext });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/** GET /api/metrics */
r.get("/metrics", async (_req, res) => {
  const total = await Job.countDocuments();
  const enc = await Job.countDocuments({ type: "encrypt" });
  const dec = await Job.countDocuments({ type: "decrypt" });
  res.json({ ok: true, total, encrypts: enc, decrypts: dec });
});

export default r;
