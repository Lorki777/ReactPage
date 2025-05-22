import { Router } from "express";
import { generateGuestToken } from "../middlewares/auth.middleware";

const router = Router();

// Ruta pública para obtener un token de invitado
router.get("/", (_req, res) => {
  const token = generateGuestToken();
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });
  // devolvemos también el JWT en el JSON
  res.json({ success: true, token });
});

export default router;
