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

// Endpoint genérico para obtener productos en el MegaMenu según el tipo
router.get("/megamenu/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ["activity", "tour", "grupal"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Tipo de producto no válido" });
    }

    let sql = "SELECT * FROM products WHERE ProductType = ? LIMIT 10";
    let rows = await executeQuery(sql, [type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos del menú" });
  }
});

router.get("/Paquetes/:month/:page", authenticateToken, async (req, res) => {
  let { month, page } = req.params as { month: string; page: string };
  const itemsPerPage = 12;
  const offset = (parseInt(page) - 1) * itemsPerPage; // Calcula el OFFSET

  console.log(`Solicitud recibida en /Paquetes/${month}/${page}`);

  if (!month || typeof month !== "string") {
    return res.status(400).json({
      error: "El parámetro 'month' es requerido y debe ser un string válido.",
    });
  }

  if (!page || isNaN(parseInt(page)) || parseInt(page) < 1) {
    return res.status(400).json({
      error: "El parámetro 'page' debe ser un número válido mayor a 0.",
    });
  }

  try {
    let sql = `
      SELECT DISTINCT months.IdMonth, products.TourSlug, products.TourName, 
      products.TourPrice, products.TourDuration 
      FROM products 
      JOIN reservationsdates ON products.id = reservationsdates.product_id 
      JOIN months ON FIND_IN_SET(months.IdMonth, reservationsdates.reservation_month) 
      WHERE months.Month = ? 
      LIMIT ? OFFSET ?
    `;

    let rows = await executeQuery(sql, [month, itemsPerPage, offset]);

    if (!rows.length) {
      return res.status(404).json({
        error: `No se encontraron paquetes para el mes: ${month} en la página ${page}`,
      });
    }

    // Obtener el total de registros para calcular páginas
    let countSql = `
      SELECT COUNT(DISTINCT products.id) AS total 
      FROM products 
      JOIN reservationsdates ON products.id = reservationsdates.product_id 
      JOIN months ON FIND_IN_SET(months.IdMonth, reservationsdates.reservation_month) 
      WHERE months.Month = ? 
    `;
    let countResult = await executeQuery(countSql, [month]);
    let totalItems = countResult[0]?.total || 0;
    let totalPages = Math.ceil(totalItems / itemsPerPage);

    res.json({
      data: rows,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    let err = error as Error;
    res.status(500).json({
      error: `Error al obtener tours en la ciudad ${month}: ${
        err.message || "Error desconocido"
      }`,
    });
  }
});

router.get(
  "/AvailableTours/:city/:page",
  authenticateToken,
  async (req, res) => {
    let { city, page } = req.params as { city: string; page: string };
    const itemsPerPage = 12;
    const offset = (parseInt(page) - 1) * itemsPerPage;

    console.log(`Solicitud recibida en /AvailableTours/${city}/${page}`);

    if (!city || typeof city !== "string") {
      return res.status(400).json({
        error: "El parámetro 'city' es requerido y debe ser un string válido.",
      });
    }

    if (!page || isNaN(parseInt(page)) || parseInt(page) < 1) {
      return res.status(400).json({
        error: "El parámetro 'page' debe ser un número válido mayor a 0.",
      });
    }

    try {
      let sql = `
        SELECT * FROM products 
        WHERE Continent = ? OR City = ? OR Country = ? OR State = ? 
        LIMIT ? OFFSET ?
      `;
      let rows = await executeQuery(sql, [
        city,
        city,
        city,
        city,
        itemsPerPage,
        offset,
      ]);

      if (!rows.length) {
        return res.status(404).json({
          error: `No se encontraron tours disponibles en la ciudad: ${city}`,
        });
      }

      let countSql = `
        SELECT COUNT(*) AS total FROM products 
        WHERE Continent = ? OR City = ? OR Country = ? OR State = ?
      `;
      let countResult = await executeQuery(countSql, [city, city, city, city]);
      let totalItems = countResult[0]?.total || 0;
      let totalPages = Math.ceil(totalItems / itemsPerPage);

      res.json({
        data: rows,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      let err = error as Error;
      console.error(
        `Error al obtener tours en la ciudad ${city}:`,
        err.message
      );
      res.status(500).json({
        error: `Error al obtener tours en la ciudad ${city}: ${
          err.message || "Error desconocido"
        }`,
      });
    }
  }
);

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
      "SELECT product_itinerary.`day`,product_itinerary.descriptionitinerary FROM product_itinerary, products WHERE product_id = products.id AND products.TourSlug = ?";
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

router.get("/Paquetes", authenticateToken, async (req, res) => {
  let { month, minPrice, maxPrice, duration, tourName, page = "1" } = req.query;
  const itemsPerPage = 12;
  const offset = (parseInt(page as string) - 1) * itemsPerPage;

  console.log(`Solicitud recibida en /Paquetes con filtros`, req.query);

  // Validaciones
  if (
    page &&
    (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)
  ) {
    return res.status(400).json({
      error: "El parámetro 'page' debe ser un número válido mayor a 0.",
    });
  }

  try {
    let sql = `
      SELECT DISTINCT months.IdMonth, products.TourSlug, products.TourName, 
      products.TourPrice, products.TourDuration 
      FROM products 
      JOIN reservationsdates ON products.id = reservationsdates.product_id 
      JOIN months ON FIND_IN_SET(months.IdMonth, reservationsdates.reservation_month) 
    `;

    let filters: string[] = [];
    let values: any[] = [];

    // Aplicar filtros dinámicamente
    if (month) {
      filters.push(`months.Month = ?`);
      values.push(month);
    }

    if (minPrice) {
      filters.push(`products.TourPrice >= ?`);
      values.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      filters.push(`products.TourPrice <= ?`);
      values.push(parseFloat(maxPrice as string));
    }

    if (duration) {
      filters.push(`products.TourDuration = ?`);
      values.push(parseInt(duration as string));
    }

    if (tourName) {
      filters.push(`products.TourName LIKE ?`);
      values.push(`%${tourName}%`);
    }

    // Agregar filtros a la consulta si existen
    if (filters.length > 0) {
      sql += ` WHERE ` + filters.join(" AND ");
    }

    // Agregar paginación
    sql += ` LIMIT ? OFFSET ?`;
    values.push(itemsPerPage, offset);

    let rows = await executeQuery(sql, values);

    if (!rows.length) {
      return res.status(404).json({
        error: "No se encontraron paquetes con los filtros aplicados.",
      });
    }

    // Obtener el total de registros para calcular páginas
    let countSql = `
      SELECT COUNT(DISTINCT products.id) AS total 
      FROM products 
      JOIN reservationsdates ON products.id = reservationsdates.product_id 
      JOIN months ON FIND_IN_SET(months.IdMonth, reservationsdates.reservation_month) 
    `;

    if (filters.length > 0) {
      countSql += ` WHERE ` + filters.join(" AND ");
    }

    let countResult = await executeQuery(countSql, values.slice(0, -2)); // Quitamos LIMIT y OFFSET
    let totalItems = countResult[0]?.total || 0;
    let totalPages = Math.ceil(totalItems / itemsPerPage);

    res.json({
      data: rows,
      totalPages,
      currentPage: parseInt(page as string),
    });
  } catch (error) {
    let err = error as Error;
    res.status(500).json({
      error: `Error al obtener tours: ${err.message || "Error desconocido"}`,
    });
  }
});

// Obtener países
router.get("/locations/countries", authenticateToken, async (_req, res) => {
  try {
    const sql = "SELECT DISTINCT Country AS name FROM products";
    const countries = await executeQuery(sql);
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener países" });
  }
});

// Obtener estados por país
router.get(
  "/locations/states/:country",
  authenticateToken,
  async (req, res) => {
    const { country } = req.params;
    try {
      const sql =
        "SELECT DISTINCT State AS name FROM products WHERE Country = ?";
      const states = await executeQuery(sql, [country]);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener estados" });
    }
  }
);

// Obtener ciudades por estado
router.get("/locations/cities/:state", authenticateToken, async (req, res) => {
  const { state } = req.params;
  try {
    const sql = "SELECT DISTINCT City AS name FROM products WHERE State = ?";
    const cities = await executeQuery(sql, [state]);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

export default router;
