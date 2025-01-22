import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import * as dotenv from "dotenv";
import { Router } from "express";
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
export const executeQuery = async (
  sql: string,
  params?: any[]
): Promise<RowDataPacket[]> => {
  try {
    const [results] = await pool.query<RowDataPacket[]>(sql, params);
    return results;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error;
  }
};

// Endpoint para obtener productos de la base de datos
router.get("/carrusel", async (_req, res) => {
  try {
    let sql = "SELECT * FROM products LIMIT 10";
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

router.get("/tour/:slug", async (req, res) => {
  const { slug } = req.params as { slug: string };
  try {
    const sql = "SELECT * FROM products WHERE TourSlug = ?";
    const rows = await executeQuery(sql, [slug]);

    if (!rows.length) {
      return res.status(404).json({
        error: `Tour no encontrado para el slug: ${slug}`,
      });
    }

    res.json(rows[0]);
  } catch (error) {
    const err = error as Error; // Aseguramos que 'error' es de tipo Error
    console.error(`Error al obtener el tour con slug ${slug}:`, err.message);
    res.status(500).json({
      error: `Error al obtener el tour con slug ${slug}: ${
        err.message || "Error desconocido"
      }`,
    });
  }
});

router.get("/cardsPagination", async (_req, res) => {
  try {
    let sql = "SELECT * FROM products";
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

export default router;
