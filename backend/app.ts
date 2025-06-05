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
import authLoginHandler from "./routes/login.routes";

import { authRouter, authenticateToken } from "./middlewares/auth.middleware";

const app: express.Application = express();

// ── A) DESACTIVAR X-POWERED-BY ───────────────────────────────────────────────────────────
// Evita exponer que el servidor corre Express
app.disable("x-powered-by");

// ── 0) TRUST PROXY (importante para que req.protocol reconozca HTTPS detrás de proxy) ─────
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);

  // ── A.1) REDIRIGIR TODO HTTP → HTTPS ───────────────────────────────────────────────
  // Solo en producción, si la petición entra por HTTP en vez de HTTPS, redirígela.
  app.use((req, res, next) => {
    // En un entorno con proxy inverso, Express ve "x-forwarded-proto".
    const proto = req.headers["x-forwarded-proto"] as string;
    if (proto && proto !== "https") {
      // Redirige a la misma URL pero con HTTPS
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// ── 1) RATE LIMITING GENERAL ───────────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // Máximo 200 peticiones por IP cada 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: "Demasiadas peticiones, intenta más tarde.",
  })
);

// ── A.2) RATE LIMIT PARA LOGIN (RUTAS CRÍTICAS) ────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Sólo 5 intentos de login por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiados intentos de inicio de sesión, inténtalo más tarde.",
});

// ── 2) CORS ────────────────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://tudominio.com"]
        : ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Para que el navegador envíe cookies (refreshToken)
  })
);

// ── 3) OTROS MIDDLEWARES: URLENCODED, COOKIES, COMPRESIÓN, JSON ────────────────────────────
// 3.1) Límite de tamaño en JSON y formularios URL-encoded
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3.2) Parser de cookies (necesario para extraer refreshToken en cookie HttpOnly)
app.use(cookieParser());

// 3.3) Compresión de respuestas
app.use(compression());

// ── 4) HELMET (CSP, HSTS, REFERRER POLICY Y FRAMEGUARD) ───────────────────────────────────
app.use(
  helmet({
    // 4.1) Content Security Policy
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
        // Otras directivas (styleSrc, fontSrc, etc.) se pueden añadir según lo requiera tu frontend.
      },
    },
    // 4.2) HSTS: forzar HTTPS en el navegador
    hsts: {
      maxAge: 63072000, // 2 años
      includeSubDomains: true,
      preload: true,
    },
    // 4.3) Referrer Policy: evitar filtrar URLs internas al navegar off-site
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // 4.4) Frameguard: prevenir que tu app se embeba en sitios ajenos
    frameguard: { action: "sameorigin" },
  })
);

// ── 5) TEST DE CONEXIÓN A BASE DE DATOS ────────────────────────────────────────────────────
(async () => {
  try {
    const c = await pool.getConnection();
    console.log("DB MariaDB conectada");
    c.release();
  } catch (e) {
    console.error("Error DB:", e);
  }
})();

// ── 6) RUTAS DE AUTENTICACIÓN ──────────────────────────────────────────────────────────────
// 6.1) Router genérico para /api/auth (registro, refresh, logout, etc.)
app.use("/api/auth", authRouter);

// 6.2) Ruta concreta de login con rate limiting específico
app.post("/api/auth/login", loginLimiter, authLoginHandler);

// ── 7) RUTAS PÚBLICAS ──────────────────────────────────────────────────────────────────────
app.use("/api/productos", productRoutes);
app.use("/api/meses", monthRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/guest-token", guestTokenRoutes);
app.use("/api/payment", paymentRoutes);

// ── A.3) MIDDLEWARE CSRF (Opcional, si usas refreshToken en cookie y tienes formularios HTML) ─
// Si tu frontend hace llamadas a endpoints que modifican datos sensibles (p.ej. cambiar contraseña),
// podrías habilitar csurf aquí y luego enviar el token al cliente. Ejemplo:
// import csurf from "csurf";
// const csrfProtection = csurf({ cookie: true });
// app.use("/api/user/update-password", csrfProtection, updatePasswordHandler);
// Nota: habilitarlo rompe las llamadas API si no incluyes el token correctamente en el cliente.

// ── 8) RUTAS PROTEGIDAS → SOLO CON JWT VÁLIDO ───────────────────────────────────────────────
app.use("/api/admin", authenticateToken, adminRoutes);

// ── 9) HEALTH CHECK (App Platform lo usará para validar contenedor) ────────────────────────
app.get("/", (_req, res) => {
  res.send("OK desde servidor app");
});

// ── 10) SERVIR FRONTEND ESTÁTICO ────────────────────────────────────────────────────────────
const dist = path.join(__dirname, "../dist");
app.use(
  express.static(dist, {
    // 10.1) Control de caching para assets estáticos (1 día)
    maxAge: "1d",
    setHeaders: (res, file) => {
      if (file.endsWith(".gz")) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Type", "application/javascript");
      }
      if (file.endsWith(".br")) {
        res.setHeader("Content-Encoding", "br");
        res.setHeader("Content-Type", "application/javascript");
      }
      // Podrías añadir Cache-Control manual si lo deseas, p.ej.:
      // res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

// Carpeta estática para la sección de admin
app.use("/admin", express.static(path.join(__dirname, "../admin-dist")));

// Carpeta estática para el frontend público
app.use("/", express.static(path.join(__dirname, "../public-dist")));

// 10.2) Ruta específica para /admin (SPA)
app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "../admin-dist/index.html"));
});

// 10.3) Ruta Catch-All sólo para GETs NO-API
// Si la ruta no empieza con /api, devolvemos index.html para que el router del frontend maneje los paths.
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "../public-dist/index.html"));
});

export default app;
