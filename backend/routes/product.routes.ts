import * as mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import * as dotenv from "dotenv";
import { Router } from "express";
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
export const executeQuery = async (
  sql: string,
  params?: any[]
): Promise<RowDataPacket[]> => {
  try {
    let [results] = await pool.query<RowDataPacket[]>(sql, params);
    return results;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error;
  }
};

// Endpoint para obtener productos de la base de datos
router.get("/carrusel", authenticateToken, async (_req, res) => {
  try {
    let sql = "SELECT * FROM products LIMIT 10";
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

router.get("/tour/:slug", authenticateToken, async (req, res) => {
  let { slug } = req.params as { slug: string };
  try {
    let sql = "SELECT * FROM products WHERE TourSlug = ?";
    let rows = await executeQuery(sql, [slug]);

    if (!rows.length) {
      return res.status(404).json({
        error: `Tour no encontrado para el slug: ${slug}`,
      });
    }

    res.json(rows[0]);
  } catch (error) {
    let err = error as Error; // Aseguramos que 'error' es de tipo Error
    console.error(`Error al obtener el tour con slug ${slug}:`, err.message);
    res.status(500).json({
      error: `Error al obtener el tour con slug ${slug}: ${
        err.message || "Error desconocido"
      }`,
    });
  }
});

router.get("/cardsPagination", authenticateToken, async (_req, res) => {
  try {
    let sql = "SELECT * FROM products";
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

router.get("/tourlist/:sluglist", authenticateToken, async (req, res) => {
  let { sluglist } = req.params as { sluglist: string };
  console.log(`Parámetro recibido: ${sluglist}`); // Registro del parámetro recibido

  try {
    // Primera consulta: obtener los títulos de las listas
    let sqlTitles = `SELECT DISTINCT list_title, list_titletxt FROM product_lists JOIN products ON product_id = products.id JOIN list_titles ON list_titles.id_list = product_lists.list_title WHERE products.TourSlug = ?`;

    console.log(
      `Ejecutando consulta SQL de títulos: ${sqlTitles} con parámetro: ${sluglist}`
    );
    let titleRows = await executeQuery(sqlTitles, [sluglist]);

    if (!titleRows.length) {
      console.warn(`No se encontraron resultados de títulos para: ${sluglist}`);
      return res.status(404).json({
        error: `Tour no encontrado para el slug: ${sluglist}`,
      });
    }

    // Segunda consulta: obtener los ítems de cada lista
    let sqlItems = `SELECT list_title, list_item FROM product_lists, products WHERE product_id = products.id AND products.TourSlug = ?`;

    console.log(
      `Ejecutando consulta SQL de ítems: ${sqlItems} con parámetro: ${sluglist}`
    );
    let itemRows = await executeQuery(sqlItems, [sluglist]);

    // Formar la respuesta final
    let response = {
      titles: titleRows, // Resultados de la primera consulta
      items: itemRows, // Resultados de la segunda consulta
    };

    console.log(`Resultados obtenidos: ${JSON.stringify(response)}`);
    res.json(response);
  } catch (error) {
    console.error(
      `Error al obtener datos para el sluglist ${sluglist}:`,
      error
    );
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/touritinerary/:sluglist", authenticateToken, async (req, res) => {
  let { sluglist } = req.params as { sluglist: string };
  console.log(`Parámetro recibido: ${sluglist}`); // Registro del parámetro recibido

  try {
    let sql =
      "SELECT list_title, list_item FROM product_lists, products WHERE product_id = products.id AND products.TourSlug = ?";
    console.log(`Ejecutando consulta SQL: ${sql} con parámetro: ${sluglist}`);
    let rows = await executeQuery(sql, [sluglist]);

    if (!rows.length) {
      console.warn(`No se encontraron resultados para: ${sluglist}`);
      return res.status(404).json({
        error: `Tour no encontrado para el slug: ${sluglist}`,
      });
    }

    console.log(`Parámetro recibido: ${sluglist}`);
    console.log(`Ejecutando consulta SQL: ${sql} con parámetro: ${sluglist}`);

    console.log(`Resultados obtenidos: ${JSON.stringify(rows)}`);
    res.json(rows);
  } catch (error) {
    console.error(
      `Error al obtener datos para el sluglist ${sluglist}:`,
      error
    );
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
