// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import responseTime from "response-time";
import { connectMongo } from "./src/db/mongo.js";
import api from "./src/routes/api.js";
import dotenv from "dotenv";

// ✅ Metrics imports
import { register, httpRequestDuration } from "./src/metrics/metrics.js";

dotenv.config();

const app = express();

// -----------------------------
// CORS CONFIGURATION
// -----------------------------
// -----------------------------
// CORS CONFIGURATION
// -----------------------------
const allowedOrigins = [
  "https://vishnu2707.github.io", // Production frontend (GitHub Pages)
  "http://127.0.0.1:5500",        // Local development via Live Server
  "http://localhost:5500",        // Local development (alt URL)
  "http://localhost:8080",        // backend local test
  "http://127.0.0.1:8080"
];

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (like Postman or server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    console.warn("CORS blocked origin:", origin);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true
}));


// -----------------------------
// SECURITY + LOGGING
// -----------------------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

// -----------------------------
// PERFORMANCE MONITORING
// -----------------------------
app.use(
  responseTime((req, res, time) => {
    const route = (req.route && req.route.path) || req.path || "unknown";
    httpRequestDuration
      .labels(req.method, route, String(res.statusCode))
      .observe(time / 1000);
  })
);

// -----------------------------
// ROUTES
// -----------------------------
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "Quardian-Safe API",
    message: "Backend running successfully.",
  });
});

// ✅ Prometheus metrics endpoint
app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send("Error generating metrics");
  }
});

app.use("/api", api);

// -----------------------------
// SERVER + MONGO CONNECTION
// -----------------------------
const port = process.env.PORT || 8080;

connectMongo(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () =>
      console.log(`✅ Quardian API live on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
