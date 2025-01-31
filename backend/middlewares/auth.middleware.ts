import { Request, Response, NextFunction } from "express";
import jwt = require("jsonwebtoken");

declare global {
  namespace Express {
    export interface Request {
      user?: any | null;
    }
  }
}

const SECRET_KEY = "secret_key";

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

export const generateGuestToken = () => {
  return jwt.sign({ role: "guest" }, SECRET_KEY, { expiresIn: "1h" });
};
