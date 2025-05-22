import { pool } from "../connection/connection";
import { RowDataPacket } from "mysql2";
import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { body, validationResult } from "express-validator";

const router = Router();

const sqlQueries2 = [
  // 🚩 Endpoint: /grupales
  `
    SELECT p.*, tp.tour_price
    FROM products p
    JOIN product_types pt
      ON p.product_type_id = pt.product_type_id
    LEFT JOIN tour_prices tp
      ON tp.product_id = p.product_id
    WHERE pt.product_type_name = 'Group'
    LIMIT 10
  `,

  // 🚩 Endpoint: /carrusel
  `
    SELECT p.tour_name,
           p.tour_duration,
           tb.tour_badge_name,
           p.tour_slug,
           tp.tour_price
    FROM products p
    LEFT JOIN tour_badges tb
      ON tb.tour_badge_id = p.tour_badge_id
    LEFT JOIN tour_prices tp
      ON tp.product_id = p.product_id
  `,

  // 🚩 Endpoint: /megamenu/:type
  `
    SELECT p.*
    FROM products p
    JOIN product_types pt
      ON p.product_type_id = pt.product_type_id
    WHERE pt.product_type_name = ?
    LIMIT 9
  `,

  // 🚩 Endpoint: /tour/:slug
  `
    SELECT p.*,
           tp.tour_price, c.city_name
    FROM products p
    LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
    LEFT JOIN cities c ON c.city_id = p.arrival_city_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 Endpoint: /minmax
  `
    SELECT
      min_days,
      max_days,
      min_price,
      max_price
    FROM search_ranges
  `,

  // 🚩 Endpoint: /AvailableTours/:city/:page
  `
    SELECT p.tour_name,
           p.tour_duration,
           tb.tour_badge_name,
           p.tour_slug,
           tp.tour_price
    FROM products p
    LEFT JOIN tour_badges tb
      ON tb.tour_badge_id = p.tour_badge_id
    LEFT JOIN destinations d
      ON d.destination_id = p.destination_id
    LEFT JOIN countries c
      ON c.country_id = p.country_id
    LEFT JOIN continents co
      ON co.continent_id = p.continent_id
    LEFT JOIN cities ci
      ON ci.city_id = p.city_id
    LEFT JOIN tour_prices tp
      ON tp.product_id = p.product_id
    LEFT JOIN states s
      ON s.state_id = p.state_id
    WHERE co.continent_name  = ?
       OR ci.city_name       = ?
       OR c.country_name     = ?
       OR s.state_name       = ?
       OR d.destination_name = ?
    LIMIT ? OFFSET ?
  `,

  // 🚩 Count SQL para: /AvailableTours/:city/:page
  `
    SELECT COUNT(*) AS total
    FROM products p
    LEFT JOIN destinations d
      ON d.destination_id = p.destination_id
    LEFT JOIN countries c
      ON c.country_id = p.country_id
    LEFT JOIN continents co
      ON co.continent_id = p.continent_id
    LEFT JOIN cities ci
      ON ci.city_id = p.city_id
    LEFT JOIN states s
      ON s.state_id = p.state_id
    WHERE co.continent_name  = ?
       OR ci.city_name       = ?
       OR c.country_name     = ?
       OR s.state_name       = ?
       OR d.destination_name = ?
  `,

  // 🚩 Endpoint: /Paquetes/:month/:page
  `
    SELECT DISTINCT m.month_id,
           p.tour_slug,
           p.tour_name,
           tp.tour_price,
           p.tour_duration
    FROM products p
    JOIN reservation_dates rd
      ON p.product_id = rd.product_id
    JOIN months m
      ON m.month_id = rd.reservation_month
    LEFT JOIN tour_prices tp
      ON tp.product_id = p.product_id
    WHERE m.month_name = ?
    LIMIT ? OFFSET ?
  `,

  // 🚩 Count SQL para: /Paquetes/:month/:page
  `
    SELECT COUNT(DISTINCT p.product_id) AS total
    FROM products p
    JOIN reservation_dates rd
      ON p.product_id = rd.product_id
    JOIN months m
      ON m.month_id = rd.reservation_month
    WHERE m.month_name = ?
  `,

  // 🚩 /tour/availability/:slug (salida desde)
  `
    SELECT c.city_name
    FROM products p
    JOIN product_availability_departures pad
      ON pad.product_id = p.product_id
    JOIN cities c
      ON c.city_id = pad.departure_city_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /tour/availability/:slug (horario)
  `
    SELECT pas.time
    FROM products p
    JOIN product_availability_schedules pas
      ON pas.product_id = p.product_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /tour/availability/:slug (cantidad)
  `
    SELECT pac.child_available,
           pac.adult_available,
           pac.quantity_available
    FROM products p
    JOIN product_availability_counts pac
      ON pac.product_id = p.product_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /tour/availability/:slug (reservation date)
  `
    SELECT rd.reservation_date
    FROM products p
    JOIN reservation_dates rd
      ON rd.product_id = p.product_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /tourlist/:sluglist (títulos de listas)
  `
    SELECT DISTINCT li.list_title_id,
                    lt.list_title_text
    FROM products p
    JOIN product_list_items li
      ON li.product_id = p.product_id
    JOIN list_titles lt
      ON lt.list_title_id = li.list_title_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /tourlist/:sluglist (ítems de listas)
  `
    SELECT li.list_title_id,
           li.item_text
    FROM products p
    JOIN product_list_items li
      ON p.product_id = li.product_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /touritinerary/:sluglist
  `
    SELECT pi.day,
           pi.description
    FROM products p
    JOIN product_itineraries pi
      ON pi.product_id = p.product_id
    WHERE p.tour_slug = ?
  `,

  // 🚩 /locations/countries/:continent
  `
    SELECT DISTINCT s.state_name AS name
    FROM products p
    JOIN states s
      ON p.state_id = s.state_id
    JOIN countries c
      ON p.country_id = c.country_id
    WHERE c.country_name = ?
  `,

  // 🚩 /locations/countries
  `
    SELECT DISTINCT c.country_name AS name
    FROM countries c
  `,

  // 🚩 /locations/states/:country
  `
    SELECT DISTINCT s.state_name AS name
    FROM products p
    JOIN states s
      ON p.state_id = s.state_id
    JOIN countries c
      ON p.country_id = c.country_id
    WHERE c.country_name = ?
  `,

  // 🚩 /locations/cities/:state
  `
    SELECT DISTINCT ci.city_name AS name
    FROM cities ci
    JOIN products p
      ON p.city_id = ci.city_id
    JOIN states s
      ON s.state_id = p.state_id
    WHERE s.state_name = ?
  `,
  // 🚩 /tour/services/:slug
  `
      SELECT
        s.service_id,
        s.service_name,
        s.city_id,
        c.city_name,
        st.service_type_id,
        st.service_type_name,
        pap.adult_price,
        pap.child_price
      FROM products p
      JOIN product_availability_prices pap ON pap.product_id = p.product_id
      JOIN services s ON s.service_id = pap.service_id
      JOIN service_types st ON st.service_type_id = pap.service_type_id
      LEFT JOIN cities c ON c.city_id = s.city_id
      WHERE p.tour_slug = ?
    `,
  // 🚩 Endpoint: /AvailableTours/:category/:page
  `
      SELECT p.tour_name,
            p.tour_duration,
            tb.tour_badge_name,
            p.tour_slug,
            tp.tour_price
      FROM products p
      LEFT JOIN tour_badges tb
        ON tb.tour_badge_id = p.tour_badge_id
      LEFT JOIN tour_prices tp
        ON tp.product_id = p.product_id
    `, // 🚩 Endpoint: /AvailableTours/:category/:page
  `
        SELECT COUNT(*) AS total
        FROM products p
        LEFT JOIN tour_badges tb
          ON tb.tour_badge_id = p.tour_badge_id
        LEFT JOIN tour_prices tp
          ON tp.product_id = p.product_id
      `,
];

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

// Endpoint para obtener productos para la pagina de Grupales
router.get("/grupales", authenticateToken, async (_req, res) => {
  try {
    let sql = sqlQueries2[0];
    let rows = await executeQuery(sql);
    res.json(rows);
    console.log(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

// Endpoint para obtener productos para los carruseles
router.get("/carrusel", authenticateToken, async (req, res) => {
  try {
    let filter = req.query.filter; // puede ser "ofertas" o "mejoresdestinos"
    let sql = sqlQueries2[1];

    if (filter === "ofertas") {
      sql += " WHERE p.homepage_category_id = 1";
    } else if (filter === "mejoresdestinos") {
      sql += " WHERE p.homepage_category_id = 2";
    }

    sql += " LIMIT 10";
    let rows = await executeQuery(sql);
    res.json(rows);
    console.log(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

// Endpoint para obtener los productos para la pagina donde se muestran las cards con paginacion
router.get(
  "/AvailableTours/:filter/:page",
  authenticateToken,
  async (req, res) => {
    const { filter, page } = req.params as { filter: string; page: string };
    const itemsPerPage = 12;
    const currentPage = parseInt(page, 10);

    // Validaciones
    if (!filter || typeof filter !== "string") {
      return res.status(400).json({
        error:
          "El parámetro 'filter' es requerido y debe ser un string válido.",
      });
    }
    if (!page || isNaN(currentPage) || currentPage < 1) {
      return res.status(400).json({
        error: "El parámetro 'page' debe ser un número válido mayor a 0.",
      });
    }

    // Definición de queries y parámetros
    let dataQuery: string;
    let countQuery: string;
    let params: any[] = [];

    if (filter === "ofertas" || filter === "mejoresdestinos") {
      // ─── Caso categoría ───────────────────────────────────────────────────
      const catId = filter === "ofertas" ? 1 : 2;

      dataQuery = `
        SELECT
          p.tour_name,
          p.tour_duration,
          tb.tour_badge_name,
          p.tour_slug,
          tp.tour_price
        FROM products p
        LEFT JOIN tour_badges tb
          ON tb.tour_badge_id = p.tour_badge_id
        LEFT JOIN tour_prices tp
          ON tp.product_id = p.product_id
        WHERE p.homepage_category_id = ?
        ORDER BY p.tour_name
        LIMIT ? OFFSET ?;
      `;
      countQuery = `
        SELECT COUNT(*) AS total
        FROM products p
        WHERE p.homepage_category_id = ?;
      `;
      params = [catId, itemsPerPage, (currentPage - 1) * itemsPerPage];
    } else {
      // ─── Caso ciudad / destino ────────────────────────────────────────────
      dataQuery = `
        SELECT
          p.tour_name,
          p.tour_duration,
          tb.tour_badge_name,
          p.tour_slug,
          tp.tour_price
        FROM products p
        LEFT JOIN tour_badges tb
          ON tb.tour_badge_id = p.tour_badge_id
        LEFT JOIN tour_prices tp
          ON tp.product_id = p.product_id
        LEFT JOIN destinations d
          ON d.destination_id = p.destination_id
        LEFT JOIN countries c
          ON c.country_id = p.country_id
        LEFT JOIN continents co
          ON co.continent_id = p.continent_id
        LEFT JOIN cities ci
          ON ci.city_id = p.city_id
        LEFT JOIN states s
          ON s.state_id = p.state_id
        WHERE
          co.continent_name    = ?
          OR ci.city_name       = ?
          OR c.country_name     = ?
          OR s.state_name       = ?
          OR d.destination_name = ?
        ORDER BY p.tour_name
        LIMIT ? OFFSET ?;
      `;
      countQuery = `
        SELECT COUNT(*) AS total
        FROM products p
        LEFT JOIN destinations d
          ON d.destination_id = p.destination_id
        LEFT JOIN countries c
          ON c.country_id = p.country_id
        LEFT JOIN continents co
          ON co.continent_id = p.continent_id
        LEFT JOIN cities ci
          ON ci.city_id = p.city_id
        LEFT JOIN states s
          ON s.state_id = p.state_id
        WHERE
          co.continent_name    = ?
          OR ci.city_name       = ?
          OR c.country_name     = ?
          OR s.state_name       = ?
          OR d.destination_name = ?;
      `;
      // Cinco veces el mismo filtro + paginación
      params = [
        filter,
        filter,
        filter,
        filter,
        filter,
        itemsPerPage,
        (currentPage - 1) * itemsPerPage,
      ];
    }

    try {
      // Ejecutar consulta de datos
      const rows = await executeQuery(dataQuery, params);

      // Para el conteo, quitamos los dos últimos params (limit & offset) si existen
      const countParams = params.slice(0, params.length === 3 ? 1 : 5);
      const countResult = await executeQuery(countQuery, countParams);
      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      if (!rows.length) {
        return res.status(404).json({
          error: `No se encontraron tours para: ${filter}`,
        });
      }

      return res.json({
        data: rows,
        totalPages,
        currentPage,
      });
    } catch (err) {
      console.error("Error en AvailableTours:", err);
      return res.status(500).json({
        error: "Error al obtener los tours. " + (err as Error).message,
      });
    }
  }
);

// Endpoint genérico para obtener productos para el megamenu
router.get("/megamenu/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ["activity", "package", "group"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Tipo de producto no válido" });
    }

    let sql = sqlQueries2[2];
    let rows = await executeQuery(sql, [type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos del menú" });
  }
});

// Endpoint para obtener productos para la pagina donde se muestra el tour
router.get("/tour/:slug", authenticateToken, async (req, res) => {
  let { slug } = req.params as { slug: string };
  try {
    let sql = sqlQueries2[3];
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

// Endpoint para obtener los minimos y maximos del buscador
router.get("/minmax", authenticateToken, async (_req, res) => {
  try {
    let sql = sqlQueries2[4];
    let rows = await executeQuery(sql);
    res.json(rows[0]);
  } catch (error) {
    let err = error as Error;
    console.log("Error al obtener los datos:", err.message);
  }
});

// Endpoint para obtener los productos para la pagina donde se muestran las cards con paginacion de la pagina de calendario
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
    let sql = sqlQueries2[7];

    let rows = await executeQuery(sql, [month, itemsPerPage, offset]);

    if (!rows.length) {
      return res.status(404).json({
        error: `No se encontraron paquetes para el mes: ${month} en la página ${page}`,
      });
    }

    // Obtener el total de registros para calcular páginas
    let countSql = sqlQueries2[8];
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

router.get("/tour/availability/:slug", authenticateToken, async (req, res) => {
  let { slug } = req.params;
  try {
    // Consultas para obtener cada tabla por separado
    let sqlSalidaDesde = sqlQueries2[9];
    let salidaDesdeRows = await executeQuery(sqlSalidaDesde, [slug]);

    let sqlHorario = sqlQueries2[10];
    let horarioRows = await executeQuery(sqlHorario, [slug]);

    let sqlNinosAdultosCantidad = sqlQueries2[11];
    let ninosAdultosCantidadRows = await executeQuery(sqlNinosAdultosCantidad, [
      slug,
    ]);

    let sqlReservationDate = sqlQueries2[12];
    let reservationDateRows = await executeQuery(sqlReservationDate, [slug]);

    // Solo se retorna 404 si TODAS las tablas están vacías
    if (
      salidaDesdeRows.length === 0 &&
      horarioRows.length === 0 &&
      ninosAdultosCantidadRows.length === 0 &&
      reservationDateRows.length === 0
    ) {
      return res.status(404).json({
        error: `Tour no encontrado para el slug: ${slug}`,
      });
    }

    // Retornar todas las tablas separadas
    res.json({
      salida_desde: salidaDesdeRows,
      horario: horarioRows,
      reservation_date: reservationDateRows,
      ninos_adultos_cantidad: ninosAdultosCantidadRows,
    });
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

// Endpoint para obtener las listas de los productos
router.get("/tourlist/:sluglist", authenticateToken, async (req, res) => {
  let { sluglist } = req.params as { sluglist: string };
  console.log(`Parámetro recibido: ${sluglist}`); // Registro del parámetro recibido

  try {
    // Primera consulta: obtener los títulos de las listas
    let sqlTitles = sqlQueries2[13];

    console.log(
      `Ejecutando consulta SQL de títulos: ${sqlTitles} con parámetro: ${sluglist}`
    );
    let titleRows = await executeQuery(sqlTitles, [sluglist]);

    // Segunda consulta: obtener los ítems de cada lista
    let sqlItems = sqlQueries2[14];
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

// Endpoint para obtener los itinerarios de los productos
router.get("/touritinerary/:sluglist", authenticateToken, async (req, res) => {
  let { sluglist } = req.params as { sluglist: string };
  console.log(`Parámetro recibido: ${sluglist}`); // Registro del parámetro recibido

  try {
    let sql = sqlQueries2[15];
    console.log(`Ejecutando consulta SQL: ${sql} con parámetro: ${sluglist}`);
    let rows = await executeQuery(sql, [sluglist]);

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

// Endpoint para obtener continentes
router.get("/locations/countries", authenticateToken, async (_req, res) => {
  try {
    const sql = sqlQueries2[17];
    const countries = await executeQuery(sql);
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener países" });
  }
});

// Endpoint para obtener países
router.get(
  "/locations/countries/:continent",
  authenticateToken,
  async (req, res) => {
    const { continent } = req.params;
    try {
      const sql = sqlQueries2[16];
      const states = await executeQuery(sql, [continent]);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener estados" });
    }
  }
);

// Endpoint para obtener países
router.get("/locations/countries", authenticateToken, async (_req, res) => {
  try {
    const sql = sqlQueries2[17];
    const countries = await executeQuery(sql);
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener países" });
  }
});

// Endpoint para obtener estados
router.get(
  "/locations/states/:country",
  authenticateToken,
  async (req, res) => {
    const { country } = req.params;
    try {
      const sql = sqlQueries2[18];
      const states = await executeQuery(sql, [country]);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener estados" });
    }
  }
);

// Endpoint para obtener ciudades
router.get("/locations/cities/:state", authenticateToken, async (req, res) => {
  const { state } = req.params;
  try {
    const sql = sqlQueries2[19];
    const cities = await executeQuery(sql, [state]);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

router.get("/tour/services/:slug", authenticateToken, async (req, res) => {
  const { slug } = req.params;
  try {
    const sql = sqlQueries2[20];

    const rows = await executeQuery(sql, [slug]);
    res.json({ services: rows });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ error: "Error al obtener servicios del tour." });
  }
});

router.get("/locations/continents", authenticateToken, async (_req, res) => {
  try {
    const sql = `SELECT DISTINCT continent_name AS name FROM continents`;
    const rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener continentes:", error);
    res.status(500).json({ error: "Error al obtener continentes" });
  }
});

//Endpoint para filtros

// En product.routes.ts
router.post(
  "/tours/filter",
  authenticateToken,

  // 1) Validación global: al menos un filtro debe no estar vacío
  body().custom((_, { req }) => {
    const fields = [
      "continent",
      "country",
      "state",
      "city",
      "min_price",
      "max_price",
      "min_days",
      "max_days",
      "product_type",
      "category",
      "badge",
      "start_date",
      "end_date",
      "month",
    ];
    const hasOne = fields.some(
      (key) =>
        req.body[key] !== undefined &&
        req.body[key] !== null &&
        req.body[key] !== ""
    );
    if (!hasOne) {
      throw new Error("Debe completar al menos un filtro.");
    }
    return true;
  }),

  // 2) Validaciones individuales, vacíos (falsy) se omiten
  body("min_price")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Debe ser un número."),
  body("max_price")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Debe ser un número."),
  body("min_days")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Debe ser un número entero."),
  body("max_days")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Debe ser un número entero."),
  body("start_date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Debe ser una fecha válida."),
  body("end_date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Debe ser una fecha válida."),
  body("month")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 12 })
    .withMessage("Mes inválido."),
  // paginación
  body("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Página inválida."),
  body("itemsPerPage")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Items inválidos."),

  async (req, res) => {
    // 3) Revisar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 4) Desestructurar filtros y paginación
    const {
      continent,
      country,
      state,
      city,
      min_price,
      max_price,
      min_days,
      max_days,
      product_type,
      category,
      badge,
      start_date,
      end_date,
      month,
      page = 1,
      itemsPerPage = 12,
    } = req.body;

    try {
      // 5) SQL base para datos y conteo (igual que antes) :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
      const baseDataSql = `
        SELECT DISTINCT p.*,
               tp.tour_price,
               c.city_name,
               pt.product_type_name,
               hc.category_name,
               tb.tour_badge_name
        FROM products p
        LEFT JOIN tour_prices tp      ON tp.product_id = p.product_id
        LEFT JOIN cities c            ON c.city_id   = p.city_id
        LEFT JOIN states s            ON s.state_id  = p.state_id
        LEFT JOIN countries co        ON co.country_id = p.country_id
        LEFT JOIN continents ct       ON ct.continent_id = p.continent_id
        LEFT JOIN product_types pt    ON pt.product_type_id = p.product_type_id
        LEFT JOIN homepage_categories hc
                                       ON hc.homepage_category_id = p.homepage_category_id
        LEFT JOIN tour_badges tb      ON tb.tour_badge_id    = p.tour_badge_id
        LEFT JOIN reservation_dates rd
                                       ON rd.product_id = p.product_id
      `;
      const baseCountSql = `
        SELECT COUNT(DISTINCT p.product_id) AS total
        FROM products p
        LEFT JOIN tour_prices tp      ON tp.product_id = p.product_id
        LEFT JOIN cities c            ON c.city_id   = p.city_id
        LEFT JOIN states s            ON s.state_id  = p.state_id
        LEFT JOIN countries co        ON co.country_id = p.country_id
        LEFT JOIN continents ct       ON ct.continent_id = p.continent_id
        LEFT JOIN product_types pt    ON pt.product_type_id = p.product_type_id
        LEFT JOIN homepage_categories hc
                                       ON hc.homepage_category_id = p.homepage_category_id
        LEFT JOIN tour_badges tb      ON tb.tour_badge_id    = p.tour_badge_id
        LEFT JOIN reservation_dates rd
                                       ON rd.product_id = p.product_id
      `;

      // 6) Construir WHERE dinámico
      let whereSql = " WHERE 1=1";
      const params: any[] = [];

      if (continent) {
        whereSql += " AND ct.continent_name = ?";
        params.push(continent);
      }
      if (country) {
        whereSql += " AND co.country_name = ?";
        params.push(country);
      }
      if (state) {
        whereSql += " AND s.state_name = ?";
        params.push(state);
      }
      if (city) {
        whereSql += " AND c.city_name = ?";
        params.push(city);
      }
      if (min_price) {
        whereSql += " AND tp.tour_price >= ?";
        params.push(min_price);
      }
      if (max_price) {
        whereSql += " AND tp.tour_price <= ?";
        params.push(max_price);
      }
      if (min_days) {
        whereSql += " AND p.tour_duration >= ?";
        params.push(min_days);
      }
      if (max_days) {
        whereSql += " AND p.tour_duration <= ?";
        params.push(max_days);
      }
      if (product_type) {
        whereSql += " AND pt.product_type_name = ?";
        params.push(product_type);
      }
      if (category) {
        whereSql += " AND hc.category_name = ?";
        params.push(category);
      }
      if (badge) {
        whereSql += " AND tb.tour_badge_name = ?";
        params.push(badge);
      }

      if (start_date && end_date) {
        whereSql += " AND rd.reservation_date BETWEEN ? AND ?";
        params.push(start_date, end_date);
      } else if (start_date) {
        whereSql += " AND rd.reservation_date >= ?";
        params.push(start_date);
      } else if (end_date) {
        whereSql += " AND rd.reservation_date <= ?";
        params.push(end_date);
      }

      if (month) {
        whereSql += " AND MONTH(rd.reservation_date) = ?";
        params.push(month);
      }

      // 7) Paginación
      const offset = (page - 1) * itemsPerPage;
      const dataSql = baseDataSql + whereSql + " LIMIT ? OFFSET ?";
      const dataParams = [...params, itemsPerPage, offset];
      const countSql = baseCountSql + whereSql;
      const countParams = params;

      // 8) Ejecutar ambas consultas en paralelo
      const [rows, countResult] = await Promise.all([
        executeQuery(dataSql, dataParams),
        executeQuery(countSql, countParams),
      ]);

      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      console.log(dataSql, dataParams); // Para depuración

      // 9) Responder
      return res.json({
        data: rows,
        totalPages,
        currentPage: page,
      });
    } catch (err) {
      console.error("Error en /tours/filter:", err);
      return res.status(500).json({
        error: "Error al filtrar tours: " + (err as Error).message,
      });
    }
  }
);

router.post("/create", authenticateToken, async (req, res) => {
  const {
    tour_name,
    tour_description,
    tour_slug,
    tour_duration,
    tour_map,
    meta_title,
    meta_description,
    canonical_url,
    meta_robots_id,
    seo_friendly_url,
    og_title,
    og_description,
    og_image,
    schema_markup,
    breadcrumb_path,
    city_id,
    state_id,
    country_id,
    continent_id,
    destination_id,
    homepage_category_id,
    is_public,
    arrival_city_id,
    min_age,
    tour_badge_id,
    product_type_id,
  } = req.body;

  // Validación mínima de campos requeridos (puedes extenderla)
  if (!tour_name || !tour_description || !tour_slug) {
    return res.status(400).json({
      error:
        "Los campos tour_name, tour_description y tour_slug son obligatorios",
    });
  }

  try {
    const sql = `
      INSERT INTO products (
        tour_name, tour_description, tour_slug,
        tour_duration, tour_map, meta_title, meta_description,
        canonical_url, meta_robots_id, seo_friendly_url, og_title,
        og_description, og_image, schema_markup, breadcrumb_path,
        city_id, state_id, country_id, continent_id, destination_id,
        homepage_category_id, is_public, arrival_city_id, min_age,
        tour_badge_id, product_type_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      tour_name,
      tour_description,
      tour_slug,
      tour_duration,
      tour_map,
      meta_title,
      meta_description,
      canonical_url,
      meta_robots_id,
      seo_friendly_url,
      og_title,
      og_description,
      og_image,
      schema_markup,
      breadcrumb_path,
      city_id,
      state_id,
      country_id,
      continent_id,
      destination_id,
      homepage_category_id,
      is_public,
      arrival_city_id,
      min_age,
      tour_badge_id,
      product_type_id,
    ];

    const [result] = await pool.query(sql, params);
    // Suponiendo que result tiene la propiedad insertId
    res.status(201).json({
      message: "Producto creado con éxito",
      productId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Error al insertar el producto:", error);
    res
      .status(500)
      .json({ error: "Error al crear el producto", details: error });
  }
});

// Endpoint para contar tours por filtro (continente, país, estado, ciudad)
router.get("/tourscount", authenticateToken, async (req, res) => {
  const { continent, country, state, city } = req.query;
  let where = [];
  let params: any[] = [];
  if (continent) {
    where.push("co.continent_name = ?");
    params.push(continent);
  }
  if (country) {
    where.push("c.country_name = ?");
    params.push(country);
  }
  if (state) {
    where.push("s.state_name = ?");
    params.push(state);
  }
  if (city) {
    where.push("ci.city_name = ?");
    params.push(city);
  }
  if (where.length === 0) {
    return res.json({ count: 0 });
  }
  const sql = `
    SELECT COUNT(*) AS count
    FROM products p
    LEFT JOIN continents co ON co.continent_id = p.continent_id
    LEFT JOIN countries c ON c.country_id = p.country_id
    LEFT JOIN states s ON s.state_id = p.state_id
    LEFT JOIN cities ci ON ci.city_id = p.city_id
    WHERE ${where.join(" AND ")}
  `;
  try {
    const rows = await executeQuery(sql, params);
    res.json({ count: rows[0]?.count ?? 0 });
  } catch (error) {
    res.status(500).json({ count: 0 });
  }
});

// Endpoint para obtener tours por filtro (con paginación)
router.get("/toursbyfilter", authenticateToken, async (req, res) => {
  const {
    continent,
    country,
    state,
    city,
    page = 1,
    itemsPerPage = 12,
  } = req.query;
  let where = [];
  let params: any[] = [];
  if (continent) {
    where.push("co.continent_name = ?");
    params.push(continent);
  }
  if (country) {
    where.push("c.country_name = ?");
    params.push(country);
  }
  if (state) {
    where.push("s.state_name = ?");
    params.push(state);
  }
  if (city) {
    where.push("ci.city_name = ?");
    params.push(city);
  }
  if (where.length === 0) {
    return res.json({ tours: [], totalPages: 1 });
  }
  const sql = `
    SELECT
      p.tour_name,
      p.tour_duration,
      tb.tour_badge_name,
      p.tour_slug,
      tp.tour_price
    FROM products p
    LEFT JOIN tour_badges tb ON tb.tour_badge_id = p.tour_badge_id
    LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
    LEFT JOIN continents co ON co.continent_id = p.continent_id
    LEFT JOIN countries c ON c.country_id = p.country_id
    LEFT JOIN states s ON s.state_id = p.state_id
    LEFT JOIN cities ci ON ci.city_id = p.city_id
    WHERE ${where.join(" AND ")}
    ORDER BY p.tour_name
    LIMIT ? OFFSET ?
  `;
  const countSql = `
    SELECT COUNT(*) AS count
    FROM products p
    LEFT JOIN continents co ON co.continent_id = p.continent_id
    LEFT JOIN countries c ON c.country_id = p.country_id
    LEFT JOIN states s ON s.state_id = p.state_id
    LEFT JOIN cities ci ON ci.city_id = p.city_id
    WHERE ${where.join(" AND ")}
  `;
  const pageNum = parseInt(page as string, 10) || 1;
  const perPage = parseInt(itemsPerPage as string, 10) || 12;
  const offset = (pageNum - 1) * perPage;
  try {
    const tours = await executeQuery(sql, [...params, perPage, offset]);
    const countRows = await executeQuery(countSql, params);
    const total = countRows[0]?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    res.json({ tours, totalPages });
  } catch (error) {
    res.status(500).json({ tours: [], totalPages: 1 });
  }
});

export default router;
