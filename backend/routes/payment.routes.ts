// src/routes/mercadopago.ts
import { Router, Request, Response, NextFunction } from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { pool } from "../connection/connection";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// 1) Inicializa cliente v2 de Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!, // tu token de producción o sandbox
  // options: { timeout: 5000 } // opcional
});

router.post(
  "/create_preference",
  authenticateToken,
  async (
    req: Request<{}, any, { items: any[]; payer: any }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { items, payer } = req.body;

      // — Validaciones básicas —
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          error:
            "El campo 'items' es requerido y debe ser un array con al menos un elemento.",
        });
        return;
      }
      if (!payer || typeof payer !== "object") {
        res.status(400).json({
          error: "El campo 'payer' es requerido y debe ser un objeto.",
        });
        return;
      }

      // — Valida precio con la base de datos —
      const { id: productId, unit_price: sentPriceRaw } = items[0];
      const sentPrice = Number(sentPriceRaw);
      if (!productId || isNaN(sentPrice)) {
        res.status(400).json({
          error: "Faltan datos del producto o el precio no es numérico.",
        });
        return;
      }
      const [rows]: any = await pool.query(
        `SELECT tp.tour_price 
         FROM tour_prices tp 
         WHERE tp.product_id = ?`,
        [productId]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: "Producto no encontrado." });
        return;
      }
      const actualPrice = Number(rows[0].tour_price);
      if (sentPrice !== actualPrice) {
        res.status(400).json({
          error:
            "El precio enviado no coincide con el precio real del producto.",
          sentPrice,
          actualPrice,
        });
        return;
      }

      // — Prepara payload para Mercado Pago —
      const mpItems = items.map((it: any) => ({
        id: it.id,
        title: it.title ?? "Producto",
        quantity: it.quantity ?? 1,
        currency_id: it.currency_id ?? "MXN",
        unit_price: Number(it.unit_price),
      }));
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

      // 2) Crea la preferencia con la clase Preference
      const preferenceApi = new Preference(mpClient);
      const mpResponse = await preferenceApi.create({ body: prefPayload });

      // 3) Devuelve al frontend el ID y la URL de inicio de pago
      res.json({
        preferenceId: mpResponse.id,
        init_point: mpResponse.init_point,
      });
      return;
    } catch (err: any) {
      console.error("Error al crear la preferencia MP:", err);
      next(err);
    }
  }
);

export default router;
