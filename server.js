import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectMongo } from "./db/mongo.js";
import api from "./routes/api.js";

const app = express();

// CORS: allow your GH Pages (add others separated by commas)
const origins = (process.env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman
    return origins.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
  },
  credentials: false
}));

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ ok: true, name: "Quardian-Safe API" }));
app.use("/api", api);

const port = process.env.PORT || 8080;
connectMongo(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API on :${port}`)))
  .catch((e) => { console.error(e); process.exit(1); });
