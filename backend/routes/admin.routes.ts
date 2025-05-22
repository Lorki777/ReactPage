import { Router, Request, Response } from "express";
import { pool } from "../connection/connection";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Helper para paginación
function getPagination(req: Request): {
  page: number;
  itemsPerPage: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const itemsPerPage = Math.max(
    1,
    parseInt(req.query.itemsPerPage as string, 10) || 10
  );
  const offset = (page - 1) * itemsPerPage;
  return { page, itemsPerPage, offset };
}

// Wrapper para queries con manejo de errores
async function execQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const [rows] = await pool.query(sql, params);
    console.log("SQL exitoso:", sql, params);
    return rows as any[];
  } catch (err) {
    console.error("Error en execQuery:", err);
    throw err;
  }
}

// Función genérica GET con paginación (signature corregida)
async function handleGet(
  table: string,
  descriptor: string,
  req: Request,
  res: Response
) {
  try {
    const { itemsPerPage, offset } = getPagination(req);
    const rows = await execQuery(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, [
      itemsPerPage,
      offset,
    ]);
    const countResult = await execQuery(
      `SELECT COUNT(*) AS total FROM ${table}`
    );
    const total = (countResult[0] as any)?.total || 0;
    res.json({ rows, total });
  } catch (error) {
    console.error(`Error en GET /${table}:`, error);
    res.status(500).json({ error: `Error interno al listar ${descriptor}` });
  }
}

// Función genérica POST
async function handlePost(
  table: string,
  fields: string[],
  req: Request,
  res: Response,
  descriptor: string
) {
  try {
    // Validar que vengan todos los campos
    const missing = fields.filter((f) => req.body[f] === undefined);
    if (missing.length) {
      return res
        .status(400)
        .json({ error: `Faltan campos: ${missing.join(", ")}` });
    }
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((f) => req.body[f]);
    await execQuery(
      `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(`Error en POST /${table}:`, error);
    res.status(500).json({ error: `Error interno al crear ${descriptor}` });
  }
}

// Configuración de rutas
interface RouteConfig {
  table: string;
  fields: string[];
  descriptor: string;
}

const configs: RouteConfig[] = [
  {
    table: "homepage_categories",
    fields: ["category_name"],
    descriptor: "categorías de portada",
  },
  { table: "cities", fields: ["city_name"], descriptor: "ciudades" },
  {
    table: "continents",
    fields: ["continent_name"],
    descriptor: "continentes",
  },
  { table: "countries", fields: ["country_name"], descriptor: "países" },
  { table: "states", fields: ["state_name"], descriptor: "estados" },
  {
    table: "destinations",
    fields: [
      "destination_name",
      "destination_country_id",
      "destination_continent_id",
      "count_tours",
    ],
    descriptor: "destinos",
  },
  {
    table: "months",
    fields: [
      "month_name",
      "month_small_banner",
      "month_large_banner",
      "month_count_products",
    ],
    descriptor: "meses",
  },
  {
    table: "tour_badges",
    fields: ["tour_badge_name"],
    descriptor: "badges de tours",
  },
  {
    table: "product_types",
    fields: ["product_type_name"],
    descriptor: "tipos de producto",
  },
  { table: "services", fields: ["service_name"], descriptor: "servicios" },
  {
    table: "service_types",
    fields: ["service_type_name"],
    descriptor: "tipos de servicio",
  },
  { table: "meta_robots", fields: ["meta_robots"], descriptor: "meta robots" },
  {
    table: "list_titles",
    fields: ["list_title_text"],
    descriptor: "títulos de lista",
  },
  {
    table: "tour_colors",
    fields: ["primary_color", "secondary_color", "product_id"],
    descriptor: "colores de tour",
  },
  {
    table: "tour_prices",
    fields: ["tour_price", "product_id"],
    descriptor: "precios de tour",
  },
  {
    table: "product_availability_schedules",
    fields: ["product_id", "time"],
    descriptor: "horarios de disponibilidad",
  },
  {
    table: "product_availability_counts",
    fields: [
      "product_id",
      "child_available",
      "adult_available",
      "quantity_available",
    ],
    descriptor: "conteos de disponibilidad",
  },
  {
    table: "product_availability_prices",
    fields: [
      "service_id",
      "service_type_id",
      "adult_price",
      "child_price",
      "product_id",
    ],
    descriptor: "precios de disponibilidad",
  },
  {
    table: "product_availability_departures",
    fields: ["product_id", "departure_city_id"],
    descriptor: "salidas de disponibilidad",
  },
  {
    table: "product_itineraries",
    fields: ["product_id", "day", "description"],
    descriptor: "itinerarios de producto",
  },
  {
    table: "product_list_items",
    fields: ["product_id", "list_title_id", "item_text"],
    descriptor: "ítems de lista de producto",
  },
  {
    table: "reservation_dates",
    fields: ["product_id", "reservation_date"],
    descriptor: "fechas de reserva",
  },
  {
    table: "flight_bookings",
    fields: [
      "product_id",
      "departure_date",
      "departure_city_id",
      "adult_count",
      "child_count",
      "departure_time",
      "quantity",
    ],
    descriptor: "reservas de vuelo",
  },
];

// Generación dinámica de rutas
configs.forEach((cfg) => {
  router.get(`/${cfg.table}`, authenticateToken, (req, res) =>
    handleGet(cfg.table, cfg.descriptor, req as Request, res as Response)
  );
  router.post(`/${cfg.table}`, authenticateToken, (req, res) =>
    handlePost(
      cfg.table,
      cfg.fields,
      req as Request,
      res as Response,
      cfg.descriptor
    )
  );
});

// Rutas sin paginación específica
router.get(
  "/search_ranges",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const rows = await execQuery("SELECT * FROM search_ranges");
      res.json({ rows });
    } catch (error) {
      console.error("Error en GET /search_ranges:", error);
      res
        .status(500)
        .json({ error: "Error interno al listar rangos de búsqueda" });
    }
  }
);
router.post(
  "/search_ranges",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { min_days, max_days, min_price, max_price } = req.body;
      await execQuery(
        "INSERT INTO search_ranges (min_days, max_days, min_price, max_price) VALUES (?, ?, ?, ?)",
        [
          min_days || null,
          max_days || null,
          min_price || null,
          max_price || null,
        ]
      );
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error en POST /search_ranges:", error);
      res
        .status(500)
        .json({ error: "Error interno al crear rangos de búsqueda" });
    }
  }
);

export default router;
