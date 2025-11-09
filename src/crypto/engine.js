import crypto from "crypto";

// Helpers
const b64 = (buf) => Buffer.from(buf).toString("base64");
const ub64 = (s) => Buffer.from(s, "base64");

// --- Encrypt (baseline). Later, plug PQC KEM here and keep the API shape.
export async function encryptHybrid(plaintext, scheme = "AES-GCM") {
  const key = crypto.randomBytes(32);       // ephemeral 256-bit
  const iv = crypto.randomBytes(12);        // 96-bit GCM nonce
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    scheme,
    ciphertext: b64(enc),
    iv: b64(iv),
    tag: b64(tag),
    key: b64(key)   // returned to caller for demo; not stored server-side
  };
}

export async function decryptHybrid({ ciphertext, iv, tag, key }) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", ub64(key), ub64(iv));
  decipher.setAuthTag(ub64(tag));
  const dec = Buffer.concat([decipher.update(ub64(ciphertext)), decipher.final()]);
  return dec.toString("utf8");
}

/*
 * 🔁 When you’re ready for PQC:
 * - Derive `key` via Kyber KEM (encapsulate → shared secret) instead of randomBytes.
 * - Keep the returned object shape identical so the frontend stays unchanged.
 */
