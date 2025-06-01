// auth.middleware.ts

import { Router, Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload, VerifyErrors } from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import Redis from "ioredis";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
dotenv.config();

// -----------------------------------------------------------------------------
// 1) Tipado del payload
// -----------------------------------------------------------------------------
export interface AppJwtPayload extends JwtPayload {
  sub: string;
  role: "guest" | "user" | "admin" | "superadmin";
  tokenVersion?: number;
  jti?: string;
  scope?: string[];
}

// -----------------------------------------------------------------------------
// 2) Configuración de clave y algoritmo
// -----------------------------------------------------------------------------
const JWT_ALG = (process.env.JWT_ALG as jwt.Algorithm) || "RS256";
let SECRET_KEY: string | Buffer = process.env.JWT_SECRET || "";
let PUBLIC_KEY: Buffer;
let PRIVATE_KEY: Buffer;

// En producción forzamos un secret robusto
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("En producción, JWT_SECRET debe existir y tener ≥32 chars");
  }
}

if (JWT_ALG === "RS256" || JWT_ALG === "ES256") {
  const privPath = process.env.JWT_PRIVATE_KEY_PATH!;
  const pubPath = process.env.JWT_PUBLIC_KEY_PATH!;
  PRIVATE_KEY = fs.readFileSync(path.resolve(privPath));
  PUBLIC_KEY = fs.readFileSync(path.resolve(pubPath));
  SECRET_KEY = PRIVATE_KEY;
}

const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

// -----------------------------------------------------------------------------
// 3) Redis para blacklist
// -----------------------------------------------------------------------------
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  redisClient.on("error", (e) => console.warn("[ioredis]", e.message));
}

// -----------------------------------------------------------------------------
// 4) Monitor de fallos repetidos (solo en prod)
// -----------------------------------------------------------------------------
const failedAttempts: Record<string, number> = {};
function logFailedAttempt(ip?: string) {
  const key = ip || "unknown";
  failedAttempts[key] = (failedAttempts[key] || 0) + 1;
  if (failedAttempts[key] >= 10) {
    console.warn(`[ALERT] IP sospechosa: ${key}`);
    failedAttempts[key] = 0;
  }
}

// -----------------------------------------------------------------------------
// 5) Middleware de protección JWT
// -----------------------------------------------------------------------------
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // 5.1 Solo HTTPS en producción
  if (process.env.NODE_ENV === "production" && req.protocol !== "https") {
    res.status(403).json({ message: "Solo HTTPS permitido" });
    return;
  }

  // 5.2 Extraer token (cookie o header)
  const token =
    req.cookies?.token ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined);

  if (!token) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  // 5.3 Verificar y decodificar
  jwt.verify(
    token,
    JWT_ALG === "RS256" || JWT_ALG === "ES256"
      ? PUBLIC_KEY!
      : (SECRET_KEY as string),
    {
      algorithms: [JWT_ALG],
      ...(JWT_ISSUER ? { issuer: JWT_ISSUER } : {}),
      ...(JWT_AUDIENCE ? { audience: JWT_AUDIENCE } : {}),
    },
    async (err: VerifyErrors | null, decoded: unknown) => {
      if (err) {
        // Log de fallo solo en prod
        if (process.env.NODE_ENV === "production") {
          logFailedAttempt(req.ip);
          console.warn(`[SEC] JWT fallo: ${err.message} | IP: ${req.ip}`);
        }
        res.status(403).json({ message: "Token no válido" });
        return;
      }

      // 5.4 Comprobar estructura mínima
      if (
        !decoded ||
        typeof decoded !== "object" ||
        !("sub" in decoded) ||
        !("role" in decoded)
      ) {
        res.status(403).json({ message: "Payload incompleto" });
        return;
      }
      const payload = decoded as AppJwtPayload;

      // 5.5 Revocación con Redis
      if (payload.jti && redisClient) {
        const bl = await redisClient.get(`blacklist:${payload.jti}`);
        if (bl) {
          res.status(403).json({ message: "Token revocado" });
          return;
        }
      }

      // 5.6 Validación de scopes (ejemplo para /api/admin)
      if (
        payload.scope &&
        !payload.scope.includes("admin") &&
        req.path.startsWith("/api/admin")
      ) {
        res.status(403).json({ message: "Permiso insuficiente" });
        return;
      }

      // 5.7 Inyectar usuario y continuar
      (req as any).user = payload;
      next();
    }
  );
}

// -----------------------------------------------------------------------------
// 6) Generador de token invitado
// -----------------------------------------------------------------------------
export function generateGuestToken(): string {
  const p: AppJwtPayload = {
    sub: "guest",
    role: "guest",
    jti: randomUUID(),
    scope: ["guest"],
  };
  return jwt.sign(p, SECRET_KEY, {
    algorithm: JWT_ALG,
    expiresIn: "15m",
    ...(JWT_ISSUER ? { issuer: JWT_ISSUER } : {}),
    ...(JWT_AUDIENCE ? { audience: JWT_AUDIENCE } : {}),
  });
}

// -----------------------------------------------------------------------------
// 7) Router de Auth (login / refresh / logout)
// -----------------------------------------------------------------------------
export const authRouter = Router();

// 7.1 Simulación de verificación de usuario
interface AuthUser {
  id: string;
  role: AppJwtPayload["role"];
  scope: string[];
  tokenVersion: number;
}
async function verifyUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  if (username === "admin" && password === "1234") {
    return { id: "42", role: "admin", scope: ["admin"], tokenVersion: 1 };
  }
  return null;
}
async function getUserTokenVersion(id: string): Promise<number> {
  return 1;
}

// 7.2 LOGIN → emite access + refresh
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await verifyUser(username, password);
  if (!user) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  // 7.2.1 Payload con type-safe role
  const payload: AppJwtPayload = {
    sub: user.id,
    role: user.role,
    scope: user.scope,
    tokenVersion: user.tokenVersion,
    jti: randomUUID(),
  };

  // 7.2.2 Access token
  const access = jwt.sign(payload, PRIVATE_KEY!, {
    algorithm: "RS256",
    expiresIn: "15m",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    keyid: process.env.JWT_KID,
  });

  // 7.2.3 Refresh token
  const rjti = randomUUID();
  const rp: AppJwtPayload = { ...payload, jti: rjti };
  const refresh = jwt.sign(rp, PRIVATE_KEY!, {
    algorithm: "RS256",
    expiresIn: "7d",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    keyid: process.env.JWT_KID,
  });

  // 7.2.4 Guardar refresh en Redis (si existe)
  if (redisClient) {
    await redisClient.set(`rt:${rjti}`, "1", "EX", 7 * 24 * 3600);
  }

  // 7.2.5 Enviar cookies seguras
  res
    .cookie("accessToken", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/refresh",
      maxAge: 7 * 24 * 3600 * 1000,
    })
    .json({ message: "Logged in" });
});

// 7.3 REFRESH → renueva access (+ rota refresh)
authRouter.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }
  const dec = jwt.decode(token, { complete: true }) as any;
  const pub = PUBLIC_KEY!;
  try {
    const pl = jwt.verify(token, pub, {
      algorithms: ["RS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as AppJwtPayload;

    if (redisClient) {
      const ok = await redisClient.get(`rt:${pl.jti}`);
      if (!ok) {
        res.status(403).json({ message: "Refresh revocado" });
        return;
      }
    }

    // Nuevo access
    const njti = randomUUID();
    pl.jti = njti;
    pl.tokenVersion = await getUserTokenVersion(pl.sub);
    const newAccess = jwt.sign(pl, PRIVATE_KEY!, {
      algorithm: "RS256",
      expiresIn: "15m",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      keyid: process.env.JWT_KID,
    });

    if (redisClient) {
      await redisClient
        .multi()
        .del(`rt:${dec.payload.jti}`)
        .set(`rt:${njti}`, "1", "EX", 7 * 24 * 3600)
        .exec();
    }

    res
      .cookie("accessToken", newAccess, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({ accessToken: newAccess });
  } catch {
    res.status(403).json({ message: "Refresh inválido" });
  }
});

// 7.4 LOGOUT → revoca access y refresh
authRouter.post("/logout", (req, res) => {
  const at = req.cookies.accessToken;
  const rt = req.cookies.refreshToken;
  if (at && redisClient) {
    const d = jwt.decode(at) as any;
    if (d?.jti) redisClient.set(`bl:${d.jti}`, "1", "EX", 15 * 60);
  }
  if (rt && redisClient) {
    const d = jwt.decode(rt) as any;
    if (d?.jti) redisClient.del(`rt:${d.jti}`);
  }
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: "/refresh" })
    .json({ message: "Logged out" });
});
