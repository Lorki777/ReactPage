import express = require("express");
import compression = require("compression");
import path = require("path");
import helmet from "helmet";
import productRoutes from "./routes/product.routes";
import monthRoutes from "./routes/month.routes";
import blogRoutes from "./routes/blogs.routes";
import guestTokenRoutes from "./routes/guest-token.routes";
import paymentRoutes from "./routes/payment.routes";
import cors = require("cors");
import { pool } from "./connection/connection";

const app: express.Application = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Probar conexión a la base de datos
(async () => {
  try {
    let connection = await pool.getConnection();
    console.log("Conexión exitosa a la base de datos MariaDB");
    connection.release();
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
  }
})();

// Middleware para seguridad y compresión
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'          ",
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
    /*referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "sameorigin" }, */
  })
);
app.use(compression());
app.use(express.json());

// Rutas principales de la API
app.use("/api/productos", productRoutes);
app.use("/api/meses", monthRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/guest-token", guestTokenRoutes);
app.use("/api/payment", paymentRoutes);

// Ruta para servir archivos comprimidos
const frontendPath = path.join(__dirname, "../dist");
app.use(
  express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".gz")) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Type", "application/javascript");
      }
      if (filePath.endsWith(".br")) {
        res.setHeader("Content-Encoding", "br");
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Manejo de rutas no definidas de la API
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).send("Esto no existe loco");
  } else {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

export default app;
