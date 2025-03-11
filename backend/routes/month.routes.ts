import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { pool } from "../connection/connection";

const router = Router();

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
    let countSql = `
        SELECT COUNT(*) AS total FROM months
      `;
    let rows = await executeQuery(sql);
    let count = await executeQuery(countSql);
    res.json({ rows, count });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

export default router;
