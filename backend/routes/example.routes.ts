import { Router } from "express";
import { getExample } from "../controllers/example.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Ruta principal
router.get("/", authenticateToken, getExample);

// Ruta de prueba de error
router.get("/error", authenticateToken, (_, res) => {
  res.status(500).json({ message: "Simulación de error del servidor" });
});

// Agregar validaciones de parámetros o rutas aquí si es necesario

export default router;
