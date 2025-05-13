import { Router } from "express";
import { pool } from "../connection/connection";
import { RowDataPacket } from "mysql2";

const router = Router();

// ── 1) Lista paginada ──────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const itemsPerPage = 5;
  const offset = (page - 1) * itemsPerPage;

  try {
    // Datos
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT blog_id, title, blog_description, blog_featured_image, published_date
       FROM blogs
       WHERE is_public = 1
       ORDER BY published_date DESC
       LIMIT ? OFFSET ?`,
      [itemsPerPage, offset]
    );
    // Conteo total
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM blogs
       WHERE is_public = 1`
    );
    const totalItems = countRows[0].total as number;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    res.json({
      data: rows,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("Error al obtener blogs paginados:", err);
    res.status(500).json({ error: "Error al obtener blogs" });
  }
});

// ── 2) Posts recientes ─────────────────────────────────────────────────────
router.get("/recent", async (_req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT blog_id, title, blog_featured_image, published_date
       FROM blogs
       WHERE is_public = 1
       ORDER BY published_date DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener posts recientes:", err);
    res.status(500).json({ error: "Error al obtener posts recientes" });
  }
});

// ── 3) Detalle de un post ───────────────────────────────────────────────────
router.get("/:blogId", async (req, res) => {
  const { blogId } = req.params;
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT *
       FROM blogs
       WHERE blog_id = ? AND is_public = 1`,
      [blogId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Blog no encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error al obtener blog ${blogId}:`, err);
    res.status(500).json({ error: "Error al obtener el blog" });
  }
});

export default router;
