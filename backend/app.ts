import express = require("express");
import compression = require("compression");
import path = require("path");
import helmet from "helmet";
import productRoutes from "./routes/product.routes";
import monthRoutes from "./routes/month.routes";
import guestTokenRoutes from "./routes/guest-token.routes";
import * as dotenv from "dotenv";
dotenv.config();
import * as mysql from "mysql2/promise";
import cors = require("cors");

const app: express.Application = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 20000,
});

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
        scriptSrc: ["'self'", "https://maps.googleapis.com"],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google.com/maps",
        ],
        imgSrc: ["'self'", "data:", "https://maps.googleapis.com"],
        connectSrc: ["'self'", "http://localhost:5173"],
      },
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:5173", // Origen permitido (el frontend)
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos HTTP permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
    credentials: true, // Permitir cookies
  })
);
app.use(compression());
app.use(express.json());

// Rutas principales de la API
app.use("/api/productos", productRoutes);
app.use("/api/meses", monthRoutes);
app.use("/api/guest-token", guestTokenRoutes);

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
