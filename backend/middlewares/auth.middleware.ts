// auth.middleware.ts

import { Request, Response, NextFunction } from "express";
// importa todo el namespace de jsonwebtoken, incluyendo tipos
import * as jwt from "jsonwebtoken";
import { JwtPayload, VerifyErrors } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user?: any | null;
    }
  }
}

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token =
    req.cookies?.token ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].split(" ")[1]
      : undefined);

  if (!token) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  jwt.verify(
    token,
    SECRET_KEY,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err) {
        res.status(403).json({ message: "Token no válido" });
        return;
      }
      req.user = decoded ?? null;
      next();
    }
  );
}

export const generateGuestToken = () => {
  return jwt.sign({ role: "guest" }, SECRET_KEY, { expiresIn: "24h" });
};
