// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt = require("jsonwebtoken");

declare global {
  namespace Express {
    export interface Request {
      user?: any | null; // Opcional y permite null
    }
  }
}

const SECRET_KEY = "secret_key"; // Cambiar en producción

// Middleware para autenticar tokens
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Token no proporcionado" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token no válido" });
    req.user = user || null;
    next();
  });
};

// Generar un token para usuarios no autenticados
export const generateGuestToken = () => {
  return jwt.sign({ role: "guest" }, SECRET_KEY, { expiresIn: "1h" });
};
