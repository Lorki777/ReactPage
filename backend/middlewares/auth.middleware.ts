import { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import jwt = require("jsonwebtoken");

declare global {
  namespace Express {
    export interface Request {
      user?: any | null;
    }
  }
}

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.token ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(
    token,
    SECRET_KEY,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err) {
        return res.status(403).json({ message: "Token no válido" });
      }
      req.user = decoded ?? null;
      next();
    }
  );
};

export const generateGuestToken = () => {
  return jwt.sign({ role: "guest" }, SECRET_KEY, { expiresIn: "24h" });
};
