// src/crypto/engine.js
import crypto from "crypto";

/**
 * AES-GCM encryption — demo placeholder for PQC layer.
 * Generates a one-time key, performs encryption fully in-memory.
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
    key: key.toString("base64"), // returned only once
  };
}

/**
 * AES-GCM decryption — takes ciphertext + key + IV + tag
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

/**
 * Ed25519 demo signature — simulates PQC signing (Dilithium/Falcon placeholder)
 */
export function signMessage(message) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const data = Buffer.from(message, "utf8");
  const signature = crypto.sign(null, data, privateKey);

  return {
    scheme: "Ed25519 (demo placeholder for PQC signatures)",
    publicKey: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
    signature: signature.toString("base64"),
  };
}

/**
 * Verifies Ed25519 signature
 */
export function verifySignature(message, publicKeyB64, signatureB64) {
  const data = Buffer.from(message, "utf8");
  const publicKeyDer = Buffer.from(publicKeyB64, "base64");
  const signature = Buffer.from(signatureB64, "base64");

  const publicKey = crypto.createPublicKey({
    key: publicKeyDer,
    format: "der",
    type: "spki",
  });

  const valid = crypto.verify(null, data, publicKey, signature);
  return valid;
}
