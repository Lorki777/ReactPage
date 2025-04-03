import { pool } from "../connection/connection";
import { RowDataPacket } from "mysql2";
import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

const sqlQueries = [
  // 🚩 Endpoint: /grupales
  `SELECT products.*, tp.TourPrice FROM products
   JOIN product_type ON products.ProductType = product_type.Id 
   LEFT JOIN tour_price AS tp ON tp.id_product = products.id
   WHERE product_type.productType = 'group' 
   LIMIT 10`,

  // 🚩 Endpoint: /carrusel
  `SELECT products.TourName,products.TourDuration,tb.TourBadge, products.TourSlug, tp.TourPrice
   FROM products 
   LEFT JOIN tourbadge AS tb ON tb.Id = products.TourBadge
   LEFT JOIN tour_price AS tp ON tp.id_product = products.id`,

  // 🚩 Endpoint: /megamenu/:type
  `SELECT * FROM products 
   JOIN product_type ON products.ProductType = product_type.Id 
   WHERE product_type.productType = ? 
   LIMIT 9`,

  // 🚩 Endpoint: /tour/:slug
  `SELECT products.*, tp.TourPrice FROM products
   LEFT JOIN tour_price AS tp ON tp.id_product = products.id
   WHERE TourSlug = ?`,

  // 🚩 Endpoint: /minmax
  `SELECT mindias, maxdias, minprecio, maxprecio FROM minmaxsearch`,

  // 🚩 Endpoint: /AvailableTours/:city/:page
  `SELECT p.TourName,p.TourDuration,tb.TourBadge, p.TourSlug, tp.TourPrice
   FROM products p 
   LEFT JOIN tourbadge AS tb ON tb.Id = p.TourBadge
   LEFT JOIN destinations d ON p.Morecategories = d.iddestination
   LEFT JOIN country c ON c.id = p.Country
   LEFT JOIN continent co ON co.id = p.Continent
   LEFT JOIN cities ci ON ci.id = p.City
   LEFT JOIN tour_price AS tp ON tp.id_product = p.id
   LEFT JOIN state s ON s.id = p.State
   WHERE co.Continent = ?
      OR ci.City = ?
      OR c.Country = ?
      OR s.State = ?
      OR d.destination = ?
   LIMIT ? OFFSET ?`,

  // 🚩 Count SQL para: /AvailableTours/:city/:page
  `SELECT COUNT(*) AS total
   FROM products p
   LEFT JOIN destinations d ON p.Morecategories = d.iddestination
   LEFT JOIN country c ON c.id = p.Country
   LEFT JOIN continent co ON co.id = p.Continent
   LEFT JOIN cities ci ON ci.id = p.City
   LEFT JOIN state s ON s.id = p.State
   WHERE co.Continent = ?
      OR ci.City = ?
      OR c.Country = ?
      OR s.State = ?
      OR d.destination = ?`,

  // 🚩 Endpoint: /Paquetes/:month/:page
  `SELECT DISTINCT months.IdMonth, products.TourSlug, products.TourName, 
          products.TourPrice, products.TourDuration 
   FROM products 
   JOIN reservationsdates ON products.id = reservationsdates.product_id 
   JOIN months ON FIND_IN_SET(months.IdMonth, reservationsdates.reservation_month) 
   WHERE months.Month = ? 
   LIMIT ? OFFSET ?`,

  // 🚩 Count SQL para: /Paquetes/:month/:page
  `SELECT COUNT(DISTINCT products.id) AS total 
   FROM products 
   JOIN reservationsdates ON products.id = reservationsdates.product_id 
   JOIN months ON FIND_IN_SET(months.IdMonth, reservationsdates.reservation_month) 
   WHERE months.Month = ?`,

  // 🚩 /tour/availability/:slug (salida desde)
  `
      SELECT pasd.salida_desde 
      FROM products p
      JOIN product_availability_salida_desde pasd ON p.id = pasd.product_id
      WHERE p.TourSlug = ?
    `,

  // 🚩 /tour/availability/:slug (horario)
  `
      SELECT pah.horario 
      FROM products p
      JOIN product_availability_horario pah ON p.id = pah.product_id
      WHERE p.TourSlug = ?
    `,

  // 🚩 /tour/availability/:slug (cantidad)
  `
      SELECT panac.ninos, panac.adultos, panac.cantidad 
      FROM products p
      JOIN product_availability_ninos_adultos_cantidad panac ON p.id = panac.product_id
      WHERE p.TourSlug = ?
    `,

  // 🚩 /tour/availability/:slug (reservation date)
  `
      SELECT rd.reservation_date 
      FROM products p
      JOIN reservationsdates rd ON p.id = rd.product_id
      WHERE p.TourSlug = ?
    `,

  // 🚩 /tourlist/:sluglist (títulos de listas)
  `SELECT DISTINCT list_title, list_titletxt 
  FROM product_lists 
  JOIN products ON product_id = products.id 
  JOIN list_titles ON list_titles.id_list = product_lists.list_title 
  WHERE products.TourSlug = ?`,

  // 🚩 /tourlist/:sluglist (ítems de listas)
  `SELECT list_title, list_item 
  FROM product_lists, products 
  WHERE product_id = products.id AND products.TourSlug = ?`,

  // 🚩 /touritinerary/:sluglist
  `SELECT product_itinerary.day, product_itinerary.descriptionitinerary 
  FROM product_itinerary, products 
  WHERE product_id = products.id AND products.TourSlug = ?`,

  // 🚩 /locations/countries/:continent
  `SELECT DISTINCT state.State AS name 
  FROM products 
  JOIN state ON products.State = state.id 
  JOIN country ON products.Country = country.id 
  WHERE country.Country = ?`,

  // 🚩 /locations/countries
  `SELECT DISTINCT country.Country AS name FROM country`,

  // 🚩 /locations/states/:country
  `SELECT DISTINCT state.State AS name 
  FROM products 
  JOIN state ON products.State = state.id 
  JOIN country ON products.Country = country.id 
  WHERE country.Country = ?`,

  // 🚩 /locations/cities/:state
  `SELECT DISTINCT cities.City AS name 
  FROM cities 
  JOIN products ON products.City = cities.id 
  JOIN state ON state.id = products.State 
  WHERE state.State = ?`,
];

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
           tp.tour_price
    FROM products p
    LEFT JOIN tour_prices tp
      ON tp.product_id = p.product_id
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
    let sql = sqlQueries[0];
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

// Endpoint para obtener productos para los carruseles
router.get("/carrusel", authenticateToken, async (req, res) => {
  try {
    let filter = req.query.filter; // puede ser "ofertas" o "mejoresdestinos"
    let sql = sqlQueries[1];

    if (filter === "ofertas") {
      sql += " WHERE products.AparicionInicio = 1";
    } else if (filter === "mejoresdestinos") {
      sql += " WHERE products.AparicionInicio = 2";
    }

    sql += " LIMIT 10";
    let rows = await executeQuery(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

// Endpoint genérico para obtener productos para el megamenu
router.get("/megamenu/:type", authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ["activity", "package", "group"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Tipo de producto no válido" });
    }

    let sql = sqlQueries[2];
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
    let sql = sqlQueries[3];
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
    let sql = sqlQueries[4];
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
    let sql = `
      SELECT DISTINCT months.IdMonth, products.TourSlug, products.TourName, products.TourDuration 
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

// Endpoint para obtener los productos para la pagina donde se muestran las cards con paginacion
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
      // <--- Incluimos el JOIN con la tabla destinations para poder filtrar por 'destination'
      let sql = sqlQueries[5];

      // <--- Notar que pasamos 6 veces 'city' en los parámetros antes de limit y offset
      let rows = await executeQuery(sql, [
        city,
        city,
        city,
        city,
        city,
        itemsPerPage,
        offset,
      ]);

      if (!rows.length) {
        return res.status(404).json({
          error: `No se encontraron tours disponibles para: ${city}`,
        });
      }

      // <--- Para contar el total, usamos la misma lógica de JOIN y el mismo filtro
      let countSql = sqlQueries[6];

      let countResult = await executeQuery(countSql, [
        city,
        city,
        city,
        city,
        city,
      ]);
      let totalItems = countResult[0]?.total || 0;
      let totalPages = Math.ceil(totalItems / itemsPerPage);

      res.json({
        data: rows,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      let err = error as Error;
      console.error(`Error al obtener tours para: ${city}:`, err.message);
      res.status(500).json({
        error: `Error al obtener tours para: ${city}: ${
          err.message || "Error desconocido"
        }`,
      });
    }
  }
);

router.get("/tour/availability/:slug", authenticateToken, async (req, res) => {
  let { slug } = req.params;
  try {
    // Consultas para obtener cada tabla por separado
    let sqlSalidaDesde = sqlQueries[9];
    let salidaDesdeRows = await executeQuery(sqlSalidaDesde, [slug]);

    let sqlHorario = sqlQueries[10];
    let horarioRows = await executeQuery(sqlHorario, [slug]);

    let sqlNinosAdultosCantidad = sqlQueries[11];
    let ninosAdultosCantidadRows = await executeQuery(sqlNinosAdultosCantidad, [
      slug,
    ]);

    let sqlReservationDate = sqlQueries[12];
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
    let sqlTitles = sqlQueries[13];

    console.log(
      `Ejecutando consulta SQL de títulos: ${sqlTitles} con parámetro: ${sluglist}`
    );
    let titleRows = await executeQuery(sqlTitles, [sluglist]);

    // Segunda consulta: obtener los ítems de cada lista
    let sqlItems = sqlQueries[14];
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
    let sql = sqlQueries[15];
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
    const sql = sqlQueries[17];
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
      const sql = sqlQueries[16];
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
    const sql = sqlQueries[17];
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
      const sql = sqlQueries[18];
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
    const sql = sqlQueries[19];
    const cities = await executeQuery(sql, [state]);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

export default router;
