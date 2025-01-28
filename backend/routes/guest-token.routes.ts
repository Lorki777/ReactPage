import { Router } from "express";
import { generateGuestToken } from "../middlewares/auth.middleware";
const router = Router();

// Ruta pública para obtener un token de invitado
router.get("/", (_req, res) => {
  const token = generateGuestToken();
  res.json({ token });
});

export default router;
