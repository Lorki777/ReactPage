import { Router, Request, Response } from "express";
import { pool } from "../connection/connection";
import { RowDataPacket } from "mysql2";
import { authenticateToken } from "../middlewares/auth.middleware";
import { body, validationResult, param, query } from "express-validator";

const router = Router();

// --- Helpers -------------------------------------------------------------
async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as T[];
}

// --- SQL dictionary
const SQL: Record<string, string> = {
  grupales: `SELECT p.*, tp.tour_price
             FROM products p
             JOIN product_types pt ON p.product_type_id = pt.product_type_id
             LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
             WHERE pt.product_type_name = 'Group' LIMIT 10`,
  carrusel: `SELECT p.tour_name, p.tour_duration, tb.tour_badge_name, p.tour_slug, tp.tour_price
             FROM products p
             LEFT JOIN tour_badges tb ON tb.tour_badge_id = p.tour_badge_id
             LEFT JOIN tour_prices tp ON tp.product_id = p.product_id`,
  megamenu: `SELECT p.* FROM products p
             JOIN product_types pt ON p.product_type_id = pt.product_type_id
             WHERE pt.product_type_name = ?
             LIMIT 9`,
  tourDetail: `SELECT p.*, tp.tour_price, c.city_name
               FROM products p
               LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
               LEFT JOIN cities c ON c.city_id = p.arrival_city_id
               WHERE p.tour_slug = ?`,
  minmax: `SELECT min_days, max_days, min_price, max_price FROM search_ranges`,
  availableByLocation: `SELECT p.tour_name, p.tour_duration, tb.tour_badge_name, p.tour_slug, tp.tour_price
                        FROM products p
                        LEFT JOIN tour_badges tb ON tb.tour_badge_id = p.tour_badge_id
                        LEFT JOIN destinations d ON d.destination_id = p.destination_id
                        LEFT JOIN countries c ON c.country_id = p.country_id
                        LEFT JOIN continents co ON co.continent_id = p.continent_id
                        LEFT JOIN cities ci ON ci.city_id = p.city_id
                        LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
                        LEFT JOIN states s ON s.state_id = p.state_id
                        WHERE co.continent_name = ? OR ci.city_name = ? OR c.country_name = ?
                          OR s.state_name = ? OR d.destination_name = ?
                        ORDER BY p.tour_name
                        LIMIT ? OFFSET ?`,
  countByLocation: `SELECT COUNT(*) AS total
                    FROM products p
                    LEFT JOIN destinations d ON d.destination_id = p.destination_id
                    LEFT JOIN countries c ON c.country_id = p.country_id
                    LEFT JOIN continents co ON co.continent_id = p.continent_id
                    LEFT JOIN cities ci ON ci.city_id = p.city_id
                    LEFT JOIN states s ON s.state_id = p.state_id
                    WHERE co.continent_name = ? OR ci.city_name = ? OR c.country_name = ?
                      OR s.state_name = ? OR d.destination_name = ?`,
  paquetesByMonth: `SELECT DISTINCT m.month_id, p.tour_slug, p.tour_name, tp.tour_price, p.tour_duration
                    FROM products p
                    JOIN reservation_dates rd ON p.product_id = rd.product_id
                    JOIN months m ON m.month_id = rd.reservation_month
                    LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
                    WHERE m.month_name = ?
                    ORDER BY p.tour_name
                    LIMIT ? OFFSET ?`,
  countPaquetesByMonth: `SELECT COUNT(DISTINCT p.product_id) AS total
                         FROM products p
                         JOIN reservation_dates rd ON p.product_id = rd.product_id
                         JOIN months m ON m.month_id = rd.reservation_month
                         WHERE m.month_name = ?`,
  availabilityDepartures: `SELECT c.city_name
                          FROM products p
                          JOIN product_availability_departures pad ON pad.product_id = p.product_id
                          JOIN cities c ON c.city_id = pad.departure_city_id
                          WHERE p.tour_slug = ?`,
  availabilitySchedules: `SELECT pas.time
                         FROM products p
                         JOIN product_availability_schedules pas ON pas.product_id = p.product_id
                         WHERE p.tour_slug = ?`,
  availabilityCounts: `SELECT pac.child_available, pac.adult_available, pac.quantity_available
                       FROM products p
                       JOIN product_availability_counts pac ON pac.product_id = p.product_id
                       WHERE p.tour_slug = ?`,
  availabilityDates: `SELECT rd.reservation_date
                      FROM products p
                      JOIN reservation_dates rd ON rd.product_id = p.product_id
                      WHERE p.tour_slug = ?`,
  listTitles: `SELECT DISTINCT li.list_title_id, lt.list_title_text
               FROM products p
               JOIN product_list_items li ON li.product_id = p.product_id
               JOIN list_titles lt ON lt.list_title_id = li.list_title_id
               WHERE p.tour_slug = ?`,
  listItems: `SELECT li.list_title_id, li.item_text
              FROM products p
              JOIN product_list_items li ON p.product_id = li.product_id
              WHERE p.tour_slug = ?`,
  itinerary: `SELECT pi.day, pi.description
              FROM products p
              JOIN product_itineraries pi ON pi.product_id = p.product_id
              WHERE p.tour_slug = ?`,
  countriesByContinent: `SELECT DISTINCT s.state_name AS name
                        FROM products p
                        JOIN states s ON p.state_id = s.state_id
                        JOIN countries c ON p.country_id = c.country_id
                        WHERE c.country_name = ?`,
  allCountries: `SELECT DISTINCT country_name AS name FROM countries`,
  statesByCountry: `SELECT DISTINCT s.state_name AS name
                    FROM products p
                    JOIN states s ON p.state_id = s.state_id
                    JOIN countries c ON p.country_id = c.country_id
                    WHERE c.country_name = ?`,
  citiesByState: `SELECT DISTINCT ci.city_name AS name
                  FROM cities ci
                  JOIN products p ON p.city_id = ci.city_id
                  JOIN states s ON s.state_id = p.state_id
                  WHERE s.state_name = ?`,
  services: `SELECT s.service_id, s.service_name, s.city_id, c.city_name,
                    st.service_type_id, st.service_type_name,
                    pap.adult_price, pap.child_price
             FROM products p
             JOIN product_availability_prices pap ON pap.product_id = p.product_id
             JOIN services s ON s.service_id = pap.service_id
             JOIN service_types st ON st.service_type_id = pap.service_type_id
             LEFT JOIN cities c ON c.city_id = s.city_id
             WHERE p.tour_slug = ?`,
  basedatafilter: `
            SELECT DISTINCT p.*, tp.tour_price, c.city_name, pt.product_type_name,
                            hc.category_name, tb.tour_badge_name
            FROM products p
            LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
            LEFT JOIN cities c ON c.city_id = p.city_id
            LEFT JOIN states s ON s.state_id = p.state_id
            LEFT JOIN countries co ON co.country_id = p.country_id
            LEFT JOIN continents ct ON ct.continent_id = p.continent_id
            LEFT JOIN product_types pt ON pt.product_type_id = p.product_type_id
            LEFT JOIN homepage_categories hc ON hc.homepage_category_id = p.homepage_category_id
            LEFT JOIN tour_badges tb ON tb.tour_badge_id = p.tour_badge_id
            LEFT JOIN reservation_dates rd ON rd.product_id = p.product_id
          `,
  basecountfilter: `
            SELECT COUNT(DISTINCT p.product_id) AS total
            FROM products p
            LEFT JOIN tour_prices tp      ON tp.product_id = p.product_id
            LEFT JOIN reservation_dates rd ON rd.product_id = p.product_id
            LEFT JOIN continents ct       ON ct.continent_id = p.continent_id
            LEFT JOIN countries co        ON co.country_id = p.country_id
            LEFT JOIN states s            ON s.state_id = p.state_id
            LEFT JOIN cities c            ON c.city_id = p.city_id
            LEFT JOIN product_types pt    ON pt.product_type_id = p.product_type_id
            LEFT JOIN homepage_categories hc
                                          ON hc.homepage_category_id = p.homepage_category_id
            LEFT JOIN tour_badges tb      ON tb.tour_badge_id = p.tour_badge_id
          `,
  dataqAvailableTours: `
            SELECT p.tour_name, p.tour_duration, tb.tour_badge_name, p.tour_slug, tp.tour_price
            FROM products p
            LEFT JOIN tour_badges tb ON tb.tour_badge_id = p.tour_badge_id
            LEFT JOIN tour_prices tp ON tp.product_id = p.product_id
            WHERE p.homepage_category_id = ?
            ORDER BY p.tour_name
            LIMIT ? OFFSET ?
          `,
  countqAvailableTours: `SELECT COUNT(*) AS total FROM products WHERE homepage_category_id = ?`,
  continents: `SELECT DISTINCT continent_name AS name FROM continents`,
};

// --- Rutas simples sin parámetros ---------------------------------------
router.get("/grupales", authenticateToken, async (_req, res) => {
  const rows = await executeQuery(SQL.grupales);
  res.json(rows);
});

router.get("/locations/countries", authenticateToken, async (_req, res) => {
  const rows = await executeQuery(SQL.allCountries);
  res.json(rows);
});

// --- Min/Max (días y precio) ---------------------------------------------
router.get("/minmax", authenticateToken, async (_req, res) => {
  const rows = await executeQuery(SQL.minmax);
  if (!rows.length) {
    res.status(404).json({ error: "No configurado" });
    return;
  }
  const { min_days, max_days, min_price, max_price } = rows[0] as any;
  res.json({
    min_days: Number(min_days),
    max_days: Number(max_days),
    min_price: Number(min_price),
    max_price: Number(max_price),
  });
});

// --- Continentes ---------------------------------------------------------
router.get("/locations/continents", authenticateToken, async (_req, res) => {
  const rows = await executeQuery(SQL.continents);
  res.json(rows);
});

// --- Carrusel ------------------------------------------------------------
router.get("/carrusel", authenticateToken, async (req, res) => {
  let q = SQL.carrusel;
  if (req.query.filter === "ofertas") q += " WHERE p.homepage_category_id = 1";
  else if (req.query.filter === "mejoresdestinos")
    q += " WHERE p.homepage_category_id = 2";
  q += " LIMIT 10";
  const rows = await executeQuery(q);
  res.json(rows);
});

// --- AvailableTours ------------------------------------------------------
router.get(
  "/AvailableTours/:filter/:page",
  authenticateToken,
  [
    param("filter").isString().trim().escape().isLength({ min: 1, max: 50 }),
    param("page").isInt({ min: 1, max: 10000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { filter, page } = req.params;
    const p = Math.max(1, parseInt(page, 10));
    const ipp = 12;
    let dataQ: string, countQ: string, params: any[];
    if (filter === "ofertas" || filter === "mejoresdestinos") {
      dataQ = SQL.dataqAvailableTours;
      countQ = SQL.countqAvailableTours;
      params = [filter === "ofertas" ? 1 : 2, ipp, (p - 1) * ipp];
    } else {
      dataQ = SQL.availableByLocation;
      countQ = SQL.countByLocation;
      params = [filter, filter, filter, filter, filter, ipp, (p - 1) * ipp];
    }
    const [rows, cnt] = await Promise.all([
      executeQuery(dataQ, params),
      executeQuery(countQ, params.slice(0, params.length - 2)),
    ]);
    const total = (cnt[0] as any).total || 0;
    res.json({
      data: rows,
      totalPages: Math.ceil(total / ipp),
      currentPage: p,
    });
  }
);

// --- Megamenu ------------------------------------------------------------
router.get(
  "/megamenu/:type",
  authenticateToken,
  [param("type").isString().trim().isIn(["activity", "package", "group"])],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Tipo inválido" });
      return;
    }
    const t = req.params.type;
    const rows = await executeQuery(SQL.megamenu, [t]);
    res.json(rows);
  }
);

// --- Tour detail ---------------------------------------------------------
router.get(
  "/tour/:slug",
  authenticateToken,
  [param("slug").isString().trim().isLength({ min: 1, max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }
    const rows = await executeQuery(SQL.tourDetail, [req.params.slug]);
    if (!rows.length) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    res.json(rows[0]);
  }
);

// --- Paquetes por mes ----------------------------------------------------
router.get(
  "/Paquetes/:month/:page",
  authenticateToken,
  [
    param("month").isString().trim().isLength({ min: 1, max: 20 }),
    param("page").isInt({ min: 1, max: 10000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Parámetros inválidos" });
      return;
    }
    const { month, page } = req.params;
    const p = Math.max(1, parseInt(page, 10));
    const ipp = 12;
    const rows = await executeQuery(SQL.paquetesByMonth, [
      month,
      ipp,
      (p - 1) * ipp,
    ]);
    const cnt = await executeQuery(SQL.countPaquetesByMonth, [month]);
    if (!rows.length) {
      res.status(404).json({ error: "No hay paquetes" });
      return;
    }
    const total = (cnt[0] as any).total || 0;
    res.json({
      data: rows,
      totalPages: Math.ceil(total / ipp),
      currentPage: p,
    });
  }
);

// --- Disponibilidad de un tour ------------------------------------------
router.get(
  "/tour/availability/:slug",
  authenticateToken,
  [param("slug").isString().trim().isLength({ min: 1, max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }
    const s = req.params.slug;
    const [dep, sch, cnts, dates] = await Promise.all([
      executeQuery(SQL.availabilityDepartures, [s]),
      executeQuery(SQL.availabilitySchedules, [s]),
      executeQuery(SQL.availabilityCounts, [s]),
      executeQuery(SQL.availabilityDates, [s]),
    ]);
    if (![dep, sch, cnts, dates].some((a) => a.length)) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    res.json({
      salida_desde: dep,
      horario: sch,
      reservation_date: dates,
      ninos_adultos_cantidad: cnts,
    });
  }
);

// --- Listas e itinerario ------------------------------------------------
router.get(
  "/tourlist/:slug",
  authenticateToken,
  [param("slug").isString().trim().isLength({ min: 1, max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }
    const s = req.params.slug;
    const [titles, items] = await Promise.all([
      executeQuery(SQL.listTitles, [s]),
      executeQuery(SQL.listItems, [s]),
    ]);
    res.json({ titles, items });
  }
);
router.get(
  "/touritinerary/:slug",
  authenticateToken,
  [param("slug").isString().trim().isLength({ min: 1, max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }
    const rows = await executeQuery(SQL.itinerary, [req.params.slug]);
    res.json(rows);
  }
);

// --- Ubicaciones ---------------------------------------------------------
router.get(
  "/locations/countries/:continent",
  authenticateToken,
  [param("continent").isString().trim().isLength({ min: 1, max: 50 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Parámetro inválido" });
      return;
    }
    const rows = await executeQuery(SQL.countriesByContinent, [
      req.params.continent,
    ]);
    res.json(rows);
  }
);
router.get(
  "/locations/states/:country",
  authenticateToken,
  [param("country").isString().trim().isLength({ min: 1, max: 50 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Parámetro inválido" });
      return;
    }
    const rows = await executeQuery(SQL.statesByCountry, [req.params.country]);
    res.json(rows);
  }
);
router.get(
  "/locations/cities/:state",
  authenticateToken,
  [param("state").isString().trim().isLength({ min: 1, max: 50 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Parámetro inválido" });
      return;
    }
    const rows = await executeQuery(SQL.citiesByState, [req.params.state]);
    res.json(rows);
  }
);

// --- Servicios -----------------------------------------------------------
router.get(
  "/tour/services/:slug",
  authenticateToken,
  [param("slug").isString().trim().isLength({ min: 1, max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }
    const rows = await executeQuery(SQL.services, [req.params.slug]);
    res.json({ services: rows });
  }
);

// --- Filtros avanzados ---------------------------------------------------
router.post(
  "/tours/filter",
  authenticateToken,
  body().custom((_, { req }) => {
    const keys = [
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
    if (!keys.some((k) => req.body[k] != null && req.body[k] !== ""))
      throw new Error("Debe completar al menos un filtro.");
    return true;
  }),
  body("min_price").optional({ checkFalsy: true }).isNumeric(),
  body("max_price").optional({ checkFalsy: true }).isNumeric(),
  body("min_days").optional({ checkFalsy: true }).isInt(),
  body("max_days").optional({ checkFalsy: true }).isInt(),
  body("end_date").optional({ checkFalsy: true }).isISO8601(),
  body("month").optional({ checkFalsy: true }).isInt({ min: 1, max: 12 }),
  body("page").optional({ checkFalsy: true }).isInt({ min: 1 }),
  body("itemsPerPage").optional({ checkFalsy: true }).isInt({ min: 1 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

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
    const baseData = SQL.basedatafilter;
    const baseCount = SQL.basecountfilter;

    let where = " WHERE 1=1",
      params: any[] = [];
    if (continent)
      (where += " AND ct.continent_name = ?"), params.push(continent);
    if (country) (where += " AND co.country_name    = ?"), params.push(country);
    if (state) (where += " AND s.state_name       = ?"), params.push(state);
    if (city) (where += " AND c.city_name       = ?"), params.push(city);
    if (min_price)
      (where += " AND tp.tour_price    >= ?"), params.push(min_price);
    if (max_price)
      (where += " AND tp.tour_price    <= ?"), params.push(max_price);
    if (min_days)
      (where += " AND p.tour_duration  >= ?"), params.push(min_days);
    if (max_days)
      (where += " AND p.tour_duration  <= ?"), params.push(max_days);
    if (product_type)
      (where += " AND pt.product_type_name = ?"), params.push(product_type);
    if (category)
      (where += " AND hc.category_name     = ?"), params.push(category);
    if (badge) (where += " AND tb.tour_badge_name   = ?"), params.push(badge);
    if (start_date && end_date) {
      (where += " AND rd.reservation_date BETWEEN ? AND ?"),
        params.push(start_date, end_date);
    } else if (start_date) {
      (where += " AND rd.reservation_date >= ?"), params.push(start_date);
    } else if (end_date) {
      (where += " AND rd.reservation_date <= ?"), params.push(end_date);
    }
    if (month)
      (where += " AND MONTH(rd.reservation_date) = ?"), params.push(month);

    const p = Math.max(1, page as number),
      ipp = itemsPerPage as number,
      offset = (p - 1) * ipp;
    const dataSql = baseData + where + " ORDER BY p.tour_name LIMIT ? OFFSET ?";
    const countSql = baseCount + where;

    const [dataRows, countRows] = await Promise.all([
      executeQuery(dataSql, [...params, ipp, offset]),
      executeQuery(countSql, params),
    ]);

    const total = (countRows[0] as any).total || 0;
    res.json({
      data: dataRows,
      totalPages: Math.ceil(total / ipp),
      currentPage: p,
    });
  }
);

// --- Conteo y listado simple por filtros --------------------------------
router.get(
  "/tourscount",
  authenticateToken,
  [
    query("continent")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 }),
    query("country").optional().isString().trim().isLength({ min: 1, max: 50 }),
    query("state").optional().isString().trim().isLength({ min: 1, max: 50 }),
    query("city").optional().isString().trim().isLength({ min: 1, max: 50 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Parámetros inválidos" });
      return;
    }
    const { continent, country, state, city } = req.query as any;
    const clauses: string[] = [],
      params: any[] = [];
    if (continent)
      clauses.push("co.continent_name = ?"), params.push(continent);
    if (country) clauses.push("c.country_name     = ?"), params.push(country);
    if (state) clauses.push("s.state_name       = ?"), params.push(state);
    if (city) clauses.push("ci.city_name       = ?"), params.push(city);
    if (!clauses.length) {
      res.json({ count: 0 });
      return;
    }

    const countSql = `
    SELECT COUNT(*) AS count FROM products p
    LEFT JOIN continents co ON co.continent_id = p.continent_id
    LEFT JOIN countries c  ON c.country_id   = p.country_id
    LEFT JOIN states s     ON s.state_id     = p.state_id
    LEFT JOIN cities ci    ON ci.city_id      = p.city_id
    WHERE ${clauses.join(" AND ")}
  `;
    const rows = await executeQuery(countSql, params);
    res.json({ count: (rows[0] as any).count || 0 });
  }
);

router.get(
  "/toursbyfilter",
  authenticateToken,
  [
    query("continent")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 }),
    query("country").optional().isString().trim().isLength({ min: 1, max: 50 }),
    query("state").optional().isString().trim().isLength({ min: 1, max: 50 }),
    query("city").optional().isString().trim().isLength({ min: 1, max: 50 }),
    query("page").optional().isInt({ min: 1, max: 10000 }),
    query("itemsPerPage").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: "Parámetros inválidos" });
      return;
    }
    const {
      continent,
      country,
      state,
      city,
      page = "1",
      itemsPerPage = "12",
    } = req.query as any;
    const clauses: string[] = [],
      params: any[] = [];
    if (continent)
      clauses.push("co.continent_name = ?"), params.push(continent);
    if (country) clauses.push("c.country_name     = ?"), params.push(country);
    if (state) clauses.push("s.state_name       = ?"), params.push(state);
    if (city) clauses.push("ci.city_name       = ?"), params.push(city);
    if (!clauses.length) {
      res.json({ tours: [], totalPages: 1 });
      return;
    }

    const p = Math.max(1, parseInt(page, 10)),
      ipp = Math.max(1, parseInt(itemsPerPage, 10)),
      offset = (p - 1) * ipp;
    const listSql = `
    SELECT p.tour_name,p.tour_duration,tb.tour_badge_name,p.tour_slug,tp.tour_price
    FROM products p
    LEFT JOIN tour_badges tb ON tb.tour_badge_id=p.tour_badge_id
    LEFT JOIN tour_prices tp ON tp.product_id=p.product_id
    LEFT JOIN continents co ON co.continent_id=p.continent_id
    LEFT JOIN countries c ON c.country_id=p.country_id
    LEFT JOIN states s    ON s.state_id=p.state_id
    LEFT JOIN cities ci   ON ci.city_id=p.city_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY p.tour_name
    LIMIT ? OFFSET ?
  `;
    const countSql = `
    SELECT COUNT(*) AS count FROM products p
    LEFT JOIN continents co ON co.continent_id=p.continent_id
    LEFT JOIN countries c  ON c.country_id=p.country_id
    LEFT JOIN states s     ON s.state_id=p.state_id
    LEFT JOIN cities ci    ON ci.city_id=p.city_id
    WHERE ${clauses.join(" AND ")}
  `;

    const [tours, cnt] = await Promise.all([
      executeQuery(listSql, [...params, ipp, offset]),
      executeQuery(countSql, params),
    ]);

    const total = (cnt[0] as any).count || 0;
    res.json({ tours, totalPages: Math.max(1, Math.ceil(total / ipp)) });
  }
);

export default router;
