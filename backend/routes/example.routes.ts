import { Router } from "express";
import { getExample } from "../controllers/example.controller";

const router = Router();

// Ruta principal
router.get("/", getExample);

// Ruta de prueba de error
router.get("/error", (_, res) => {
  res.status(500).json({ message: "Simulación de error del servidor" });
});

// Agregar validaciones de parámetros o rutas aquí si es necesario

export default router;
