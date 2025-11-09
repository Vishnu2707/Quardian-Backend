import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectMongo } from "./src/db/mongo.js";
import api from "./src/routes/api.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// -----------------------------
// CORS CONFIGURATION
// -----------------------------
const allowedOrigins = [
  "https://vishnu2707.github.io", // your frontend on GitHub Pages
  "http://localhost:8080",        // local testing
  "http://127.0.0.1:8080"
];

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (e.g., Postman or curl)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: false
}));

// -----------------------------
// SECURITY + LOGGING
// -----------------------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

// -----------------------------
// ROUTES
// -----------------------------
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Quardian-Safe API", message: "Backend running successfully." });
});

app.use("/api", api);

// -----------------------------
// SERVER + MONGO CONNECTION
// -----------------------------
const port = process.env.PORT || 8080;

connectMongo(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => console.log(`Quardian API live on port ${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
