import { Router } from "express";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
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
 * @param sqlQuery - La consulta SQL a ejecutar
 * @param params - Parámetros opcionales para la consulta parametrizada
 * @returns - Resultado de la consulta
 */
export const executeQuery = async (sql: string, params: any[] = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error; // Lanza el error para manejarlo donde se llame
  }
};

// Endpoint para obtener productos de la base de datos
router.get("/", async (_req, res) => {
  try {
    const sql = "SELECT * FROM products";
    const rows = await executeQuery(sql);
    res.json(rows); // Devuelve los resultados como JSON
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

export default router;
