// src/crypto/engine.js
import crypto from "crypto";

/**
 * AES-GCM encryption demo — placeholder for PQC layer
 * Generates a one-time key, performs encryption in-memory (not stored)
 */
export function encryptData(plainText, algorithm = "AES-GCM") {
  const key = crypto.randomBytes(32); // 256-bit key
  const iv = crypto.randomBytes(12);  // GCM IV size
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    algorithm,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
    key: key.toString("base64"),
  };
}

/**
 * AES-GCM decryption demo — takes ciphertext + key + IV + tag
 */
export function decryptData(ciphertext, key, iv, tag) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
