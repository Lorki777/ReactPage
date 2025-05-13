// src/routes/mercadopago.ts
import { Router } from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { pool } from "../connection/connection";

const router = Router();

// 1) Inicializa cliente v2 de Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  // options: { timeout: 5000 } // opcional
});

router.post("/create_preference", async (req, res) => {
  try {
    const { items, payer } = req.body;

    // — Validaciones básicas —
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error:
          "El campo 'items' es requerido y debe ser un array con al menos un elemento.",
      });
    }
    if (!payer || typeof payer !== "object") {
      return res.status(400).json({
        error: "El campo 'payer' es requerido y debe ser un objeto.",
      });
    }

    // — Extrae y valida producto y precio enviados —
    const { id: productId, unit_price: sentPriceRaw } = items[0];
    const sentPrice = Number(sentPriceRaw);
    if (!productId || isNaN(sentPrice)) {
      return res.status(400).json({
        error: "Faltan datos del producto o el precio no es numérico.",
      });
    }

    // — Consulta precio real en la BD —
    const [rows]: any = await pool.query(
      `SELECT tp.tour_price
         FROM tour_prices tp
        WHERE tp.product_id = ?`,
      [productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }
    const actualPrice = Number(rows[0].tour_price);
    if (sentPrice !== actualPrice) {
      return res.status(400).json({
        error: "El precio enviado no coincide con el precio real del producto.",
        sentPrice,
        actualPrice,
      });
    }

    // — Prepara los ítems para MP (title, qty, currency_id, unit_price) —
    const mpItems = items.map((it: any) => ({
      id: it.id,
      title: it.title ?? "Producto",
      quantity: it.quantity ?? 1,
      currency_id: it.currency_id ?? "MXN",
      unit_price: Number(it.unit_price),
    }));

    // — Crea la preferencia —
    const prefPayload = {
      items: mpItems,
      payer,
      back_urls: {
        success: process.env.SUCCESS_URL!,
        failure: process.env.FAILURE_URL!,
        pending: process.env.PENDING_URL!,
      },
      auto_return: "approved",
    };

    // 2) Usa la clase Preference para crearla
    const preferenceApi = new Preference(mpClient);
    const mpResponse = await preferenceApi.create({ body: prefPayload });

    // 3) Devuelve al frontend el ID y la URL de inicio de pago
    return res.json({
      preferenceId: mpResponse.id,
      init_point: mpResponse.init_point,
    });
  } catch (err: any) {
    console.error("Error al crear la preferencia MP:", err);
    return res.status(500).json({
      error: "Error interno al crear la preferencia de pago.",
      details: err.message,
    });
  }
});

export default router;
