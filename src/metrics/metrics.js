// src/metrics/metrics.js
import client from "prom-client";

/**
 * Prometheus registry and common metrics.
 */
export const register = new client.Registry();

// Collect Node process metrics (CPU, memory, event loop, GC, etc.)
client.collectDefaultMetrics({ register });

// Request duration histogram (labeled by route & method & status)
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

// Business counters: encryption/decryption/sign/verify
export const encryptCounter = new client.Counter({
  name: "quardian_encrypt_total",
  help: "Total encrypt calls",
});
export const decryptCounter = new client.Counter({
  name: "quardian_decrypt_total",
  help: "Total decrypt calls",
});
export const signCounter = new client.Counter({
  name: "quardian_sign_total",
  help: "Total sign calls",
});
export const verifyCounter = new client.Counter({
  name: "quardian_verify_total",
  help: "Total verify calls",
});

// Gauges for last payload sizes (useful for quick demo graphs)
export const lastCipherLen = new client.Gauge({
  name: "quardian_last_ciphertext_bytes",
  help: "Length of last produced ciphertext in bytes",
});

register.registerMetric(httpRequestDuration);
register.registerMetric(encryptCounter);
register.registerMetric(decryptCounter);
register.registerMetric(signCounter);
register.registerMetric(verifyCounter);
register.registerMetric(lastCipherLen);
