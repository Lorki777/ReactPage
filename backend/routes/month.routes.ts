import { Router } from "express";
import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { authenticateToken } from "../middlewares/auth.middleware";
dotenv.config();

const router = Router();

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

/**
 * Método reutilizable para ejecutar consultas SQL
 */
export const executeQuery = async (sql: string) => {
  try {
    let [results] = await pool.query(sql);
    return results;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error; // Lanza el error para manejarlo donde se llame
  }
};

// Endpoint para obtener los meses de la base de datos
router.get("/", authenticateToken, async (_req, res) => {
  try {
    let sql = "SELECT * FROM months";
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

export default router;
