// app.ts

import express = require("express");
import compression = require("compression");
import path = require("path");
import helmet from "helmet";
import cors = require("cors");
import rateLimit from "express-rate-limit";
var cookieParser = require("cookie-parser");

import { pool } from "./connection/connection";
import productRoutes from "./routes/product.routes";
import monthRoutes from "./routes/month.routes";
import blogRoutes from "./routes/blogs.routes";
import guestTokenRoutes from "./routes/guest-token.routes";
import paymentRoutes from "./routes/payment.routes";
import adminRoutes from "./routes/admin.routes";

import { authRouter, authenticateToken } from "./middlewares/auth.middleware";

const app: express.Application = express();

// ── 0) TRUST PROXY (importante para que req.protocol reconozca HTTPS detrás de proxy) ───────
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ── 1) Rate limiting general ─────────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Demasiadas peticiones, intenta más tarde.",
  })
);

// ── 2) CORS ────────────────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://tudominio.com"]
        : ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // para que el navegador envíe cookies
  })
);

// ── 3) Otros middlewares: cookies, compresión, JSON ────────────────────────────────────────
app.use(cookieParser());
app.use(compression());
app.use(express.json());

// ── 4) Helmet (CSP, HSTS y más) ────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://maps.googleapis.com",
          "https://gso.kommo.com",
          "https://widgets.priceres.com.mx",
        ],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google.com/maps",
          "https://gso.kommo.com",
          "https://widgets.priceres.com.mx",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://maps.googleapis.com",
          "https://gso.kommo.com",
          "https://widgets.priceres.com.mx",
        ],
        connectSrc: [
          "'self'",
          "https://gso.kommo.com",
          "https://widgets.priceres.com.mx",
        ],
      },
    },
    hsts: {
      maxAge: 63072000, // 2 años
      includeSubDomains: true,
      preload: true,
    },
    // referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // frameguard: { action: "sameorigin" },
  })
);

// ── 5) Test DB ──────────────────────────────────────────────────────────────────────────────
(async () => {
  try {
    const c = await pool.getConnection();
    console.log("DB MariaDB conectada");
    c.release();
  } catch (e) {
    console.error("Error DB:", e);
  }
})();

// ── 6) Rutas de autenticación ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ── 7) Rutas públicas ──────────────────────────────────────────────────────────────────────
app.use("/api/productos", productRoutes);
app.use("/api/meses", monthRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/guest-token", guestTokenRoutes);
app.use("/api/payment", paymentRoutes);

// ── 8) Rutas protegidas → sólo con JWT válido ───────────────────────────────────────────────
app.use("/api/admin", authenticateToken, adminRoutes);

// ── 9) Health check (App Platform lo usará para validar contenedor) ────────────────────────
app.get("/", (_req, res) => {
  res.send("OK desde servidor app");
});

// ── 10) Frontend estático ───────────────────────────────────────────────────────────────────
const dist = path.join(__dirname, "../dist");
app.use(
  express.static(dist, {
    setHeaders: (res, file) => {
      if (file.endsWith(".gz")) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Type", "application/javascript");
      }
      if (file.endsWith(".br")) {
        res.setHeader("Content-Encoding", "br");
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);
app.use("/admin", express.static(path.join(__dirname, "../admin-dist")));
app.use("/", express.static(path.join(__dirname, "../public-dist")));

app.get("/admin", (_, _res) => {
  _res.sendFile(path.join(__dirname, "../admin-dist/index.html"));
});
app.get("/{*any}", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res
      .status(404)
      .sendFile(path.join(__dirname, "../public-dist/index.html"));
  }
});

export default app;
