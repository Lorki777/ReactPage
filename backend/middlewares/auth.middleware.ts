// auth.middleware.ts

import { Router, Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload, VerifyErrors } from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import Redis from "ioredis";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import rateLimit from "express-rate-limit";
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
// 2) Configuración de algoritmo y llaves + rotación de llaves
// -----------------------------------------------------------------------------
const ALLOWED_ALGS: jwt.Algorithm[] = ["RS256", "ES256", "HS256"];
const JWT_ALG = (process.env.JWT_ALG as jwt.Algorithm) || "RS256";
if (!ALLOWED_ALGS.includes(JWT_ALG)) {
  throw new Error(
    `JWT_ALG inválido: ${JWT_ALG}. Debe ser uno de ${ALLOWED_ALGS.join(", ")}`
  );
}

// SECRET_KEY se usa solo si JWT_ALG === "HS256"
let SECRET_KEY: string | Buffer = "";
if (JWT_ALG === "HS256") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      "En producción, JWT_SECRET debe existir y tener ≥32 chars cuando se usa HS256"
    );
  }
  SECRET_KEY = process.env.JWT_SECRET;
}

// Para RS256/ES256, cargamos llaves de archivo y permitimos rotación
const JWT_KID = process.env.JWT_KID; // El key ID activo para firmar/verificar
let PRIVATE_KEY: Buffer | null = null;
const publicKeysByKid: Record<string, Buffer> = {};

if (JWT_ALG === "RS256" || JWT_ALG === "ES256") {
  const privPath = process.env.JWT_PRIVATE_KEY_PATH;
  const pubPath = process.env.JWT_PUBLIC_KEY_PATH;
  if (!privPath || !pubPath) {
    throw new Error(
      "Debe proveerse JWT_PRIVATE_KEY_PATH y JWT_PUBLIC_KEY_PATH para RS256/ES256"
    );
  }

  // Cargar llave privada para firmar
  PRIVATE_KEY = fs.readFileSync(path.resolve(privPath));

  // Cargar la llave pública actual en el mapa, indexada por JWT_KID
  const pubKeyBuffer = fs.readFileSync(path.resolve(pubPath));
  if (!JWT_KID) {
    throw new Error("Debe definirse JWT_KID para la llave pública actual");
  }
  publicKeysByKid[JWT_KID] = pubKeyBuffer;

  // Si en un futuro rotas la llave, solo hace falta agregar:
  // publicKeysByKid["nuevoKid"] = fs.readFileSync("ruta/a/new_pub.pem");
}

// -----------------------------------------------------------------------------
// 3) Redis para blacklist (access) / whitelist (refresh)
// -----------------------------------------------------------------------------
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  redisClient.on("error", (e) => console.warn("[ioredis]", e.message));
}
const ACCESS_BLACKLIST_PREFIX = "blacklist"; // p.ej. "blacklist:<jti>"
const REFRESH_WHITELIST_PREFIX = "rt"; // p.ej. "rt:<jti>"

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
  // 5.1 Solo HTTPS en producción (asegurar trust proxy en server.ts)
  if (process.env.NODE_ENV === "production" && req.protocol !== "https") {
    res.status(403).json({ message: "Solo HTTPS permitido" });
    return;
  }

  // 5.2 Extraer token de cookie “accessToken” o header Authorization
  const token =
    req.cookies?.accessToken ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined);

  if (!token) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  // 5.2.1 Rechazar alg="none"
  const decodedHeader = jwt.decode(token, { complete: true }) as any;
  if (decodedHeader?.header?.alg === "none") {
    res.status(403).json({ message: "Algoritmo inválido" });
    return;
  }

  // 5.2.2 Determine qué llave usar para verificar:
  let keyToVerify: Buffer | string | undefined;
  if (JWT_ALG === "HS256") {
    keyToVerify = SECRET_KEY as string;
  } else {
    // RS256 o ES256: buscar por kid
    const kid = decodedHeader?.header?.kid;
    if (!kid) {
      res.status(403).json({ message: "Falta kid en cabecera" });
      return;
    }
    const pubKey = publicKeysByKid[kid];
    if (!pubKey) {
      res
        .status(403)
        .json({ message: `Clave pública no encontrada para kid: ${kid}` });
      return;
    }
    keyToVerify = pubKey;
  }

  // 5.2.3 Si Redis no está disponible en producción, fallar seguro
  if (!redisClient && process.env.NODE_ENV === "production") {
    console.error(
      "Redis no disponible, cancelando autenticación por seguridad."
    );
    res.status(503).json({ message: "Servicio temporalmente no disponible" });
    return;
  }

  // 5.3 Verificar y decodificar el token
  jwt.verify(
    token,
    keyToVerify!,
    {
      algorithms: [JWT_ALG],
      ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
      ...(process.env.JWT_AUDIENCE
        ? { audience: process.env.JWT_AUDIENCE }
        : {}),
      clockTolerance: 5, // ±5 s de tolerancia
    },
    async (err: VerifyErrors | null, decoded: unknown) => {
      if (err) {
        if (process.env.NODE_ENV === "production") {
          logFailedAttempt(req.ip);
          console.warn(`[SEC] JWT fallo: ${err.message} | IP: ${req.ip}`);
        }
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // 5.4 Validar estructura mínima del payload
      if (
        !decoded ||
        typeof decoded !== "object" ||
        !("sub" in decoded) ||
        !("role" in decoded)
      ) {
        return res.status(401).json({ message: "Payload incompleto" });
      }
      const payload = decoded as AppJwtPayload;

      // 5.5 Validar tokenVersion
      try {
        const currentVersion = await getUserTokenVersion(payload.sub);
        if (payload.tokenVersion !== currentVersion) {
          return res.status(401).json({ message: "Token desactualizado" });
        }
      } catch {
        return res
          .status(401)
          .json({ message: "Error validando tokenVersion" });
      }

      // 5.6 Revocación con Redis (access tokens)
      if (payload.jti && redisClient) {
        const blacklisted = await redisClient.get(
          `${ACCESS_BLACKLIST_PREFIX}:${payload.jti}`
        );
        if (blacklisted) {
          return res.status(401).json({ message: "Token revocado" });
        }
      }

      // 5.7 Validación de scopes/roles para rutas /api/admin
      if (
        payload.scope &&
        !payload.scope.includes("admin") &&
        req.path.startsWith("/api/admin")
      ) {
        return res.status(403).json({ message: "Permiso insuficiente" });
      }

      // 5.8 Inyectar usuario en req y continuar
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
    tokenVersion: 0,
  };

  if (JWT_ALG === "HS256") {
    return jwt.sign(p, SECRET_KEY as string, {
      algorithm: "HS256",
      expiresIn: "15m",
      ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
      ...(process.env.JWT_AUDIENCE
        ? { audience: process.env.JWT_AUDIENCE }
        : {}),
    });
  } else {
    // RS256 o ES256
    if (!PRIVATE_KEY || !JWT_KID) {
      throw new Error("No hay PRIVATE_KEY o JWT_KID configurado para firmar");
    }
    return jwt.sign(p, PRIVATE_KEY, {
      algorithm: JWT_ALG,
      expiresIn: "15m",
      ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
      ...(process.env.JWT_AUDIENCE
        ? { audience: process.env.JWT_AUDIENCE }
        : {}),
      keyid: JWT_KID,
    });
  }
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
  // TODO: Reemplazar por consulta real a BD / Active Directory
  if (username === "admin" && password === "1234") {
    return { id: "42", role: "admin", scope: ["admin"], tokenVersion: 1 };
  }
  return null;
}
async function getUserTokenVersion(id: string): Promise<number> {
  // TODO: Obtener tokenVersion del usuario desde BD o caché
  return 1;
}

// -----------------------------------------------------------------------------
// 7.2 Rate limiting en /login
// -----------------------------------------------------------------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: "Demasiados intentos de login; inténtalo en 15 minutos",
});
authRouter.post("/login", loginLimiter, async (req, res) => {
  // 7.2.1 Validar esquema de username/password
  const { username, password } = req.body;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length > 100 ||
    password.length > 100
  ) {
    res.status(400).json({ message: "Parámetros inválidos" });
    return;
  }

  const user = await verifyUser(username, password);
  if (!user) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  // 7.2.2 Construir payload type-safe
  const payload: AppJwtPayload = {
    sub: user.id,
    role: user.role,
    scope: user.scope,
    tokenVersion: user.tokenVersion,
    jti: randomUUID(),
  };

  // 7.2.3 Generar Access Token
  let access: string;
  if (JWT_ALG === "HS256") {
    access = jwt.sign(payload, SECRET_KEY as string, {
      algorithm: "HS256",
      expiresIn: "15m",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } else {
    // RS256 o ES256
    if (!PRIVATE_KEY || !JWT_KID) {
      throw new Error("No hay PRIVATE_KEY o JWT_KID configurado para firmar");
    }
    access = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: JWT_ALG,
      expiresIn: "15m",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      keyid: JWT_KID,
    });
  }

  // 7.2.4 Generar Refresh Token
  const rjti = randomUUID();
  const rp: AppJwtPayload = {
    ...payload,
    jti: rjti,
  };
  let refresh: string;
  if (JWT_ALG === "HS256") {
    refresh = jwt.sign(rp, SECRET_KEY as string, {
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } else {
    refresh = jwt.sign(rp, PRIVATE_KEY!, {
      algorithm: JWT_ALG,
      expiresIn: "7d",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      keyid: JWT_KID,
    });
  }

  // 7.2.5 Guardar refresh en Redis (whitelist)
  if (redisClient) {
    await redisClient.set(
      `${REFRESH_WHITELIST_PREFIX}:${rjti}`,
      "1",
      "EX",
      7 * 24 * 3600 // 7 días
    );
  }

  // 7.2.6 Enviar cookies seguras
  res
    .cookie("accessToken", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // previene CSRF
      path: "/api", // solo para rutas /api/*
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // previene CSRF
      path: "/refresh",
      maxAge: 7 * 24 * 3600 * 1000,
    })
    .json({ message: "Logged in" });
});

// -----------------------------------------------------------------------------
// 7.3 Rate limiting en /refresh para evitar abuso
// -----------------------------------------------------------------------------
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos de refresh por IP
  message: "Demasiadas peticiones de refresh, inténtalo más tarde",
});
authRouter.post("/refresh", refreshLimiter, async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }

  // 7.3.1 Rechazar alg="none"
  const decodedHeader = jwt.decode(token, { complete: true }) as any;
  if (decodedHeader?.header?.alg === "none") {
    res.status(403).json({ message: "Algoritmo inválido" });
    return;
  }

  // 7.3.2 Si Redis no está disponible en producción, fallar seguro
  if (!redisClient && process.env.NODE_ENV === "production") {
    console.error("Redis no disponible, cancelando refresh por seguridad.");
    res.status(503).json({ message: "Servicio temporalmente no disponible" });
    return;
  }

  // 7.3.3 Determinar la llave para verificar el refresh token
  let keyToVerify: Buffer | string | undefined;
  if (JWT_ALG === "HS256") {
    keyToVerify = SECRET_KEY as string;
  } else {
    const kidHeader = decodedHeader.header.kid;
    const pubKey = publicKeysByKid[kidHeader];
    if (!pubKey) {
      res.status(403).json({
        message: `Clave pública no encontrada para kid: ${kidHeader}`,
      });
      return;
    }
    keyToVerify = pubKey;
  }

  try {
    const pl = jwt.verify(token, keyToVerify!, {
      algorithms: [JWT_ALG],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 5,
    }) as AppJwtPayload;

    // 7.3.4 Validar tokenVersion
    const currentVersion = await getUserTokenVersion(pl.sub);
    if (pl.tokenVersion !== currentVersion) {
      res.status(401).json({ message: "Refresh token desactualizado" });
      return;
    }

    // 7.3.5 Verificar whitelist en Redis
    if (redisClient) {
      const ok = await redisClient.get(`${REFRESH_WHITELIST_PREFIX}:${pl.jti}`);
      if (!ok) {
        res.status(401).json({ message: "Refresh revocado" });
        return;
      }
    }

    // 7.3.6 Generar nuevo access token
    let newAccess: string;
    const njti = randomUUID();
    pl.jti = njti;
    pl.tokenVersion = currentVersion;

    if (JWT_ALG === "HS256") {
      newAccess = jwt.sign(pl, SECRET_KEY as string, {
        algorithm: "HS256",
        expiresIn: "15m",
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      });
    } else {
      newAccess = jwt.sign(pl, PRIVATE_KEY!, {
        algorithm: JWT_ALG,
        expiresIn: "15m",
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        keyid: JWT_KID,
      });
    }

    // 7.3.7 Rotar refresh token en Redis: eliminar antiguo, guardar nuevo
    if (redisClient) {
      await redisClient
        .multi()
        .del(`${REFRESH_WHITELIST_PREFIX}:${decodedHeader.payload.jti}`)
        .set(`${REFRESH_WHITELIST_PREFIX}:${njti}`, "1", "EX", 7 * 24 * 3600)
        .exec();
    }

    // 7.3.8 Enviar nueva cookie de acceso
    res
      .cookie("accessToken", newAccess, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api",
        maxAge: 15 * 60 * 1000,
      })
      .json({ accessToken: newAccess });
  } catch {
    res.status(401).json({ message: "Refresh inválido" });
    return;
  }
});

// -----------------------------------------------------------------------------
// 7.4 LOGOUT → revoca access y refresh
// -----------------------------------------------------------------------------
authRouter.post("/logout", async (req, res) => {
  const at = req.cookies.accessToken;
  const rt = req.cookies.refreshToken;

  // 7.4.1 Revocar access usando verify en lugar de decode
  if (at && redisClient) {
    const decodedHeaderAT = jwt.decode(at, { complete: true }) as any;
    const kidAT = decodedHeaderAT?.header?.kid;
    let keyToVerifyAT: Buffer | string | undefined;

    if (JWT_ALG === "HS256") {
      keyToVerifyAT = SECRET_KEY as string;
    } else {
      keyToVerifyAT = publicKeysByKid[kidAT];
    }

    if (keyToVerifyAT) {
      try {
        const pl = jwt.verify(at, keyToVerifyAT, {
          algorithms: [JWT_ALG],
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }) as AppJwtPayload;
        if (pl?.jti) {
          await redisClient.set(
            `${ACCESS_BLACKLIST_PREFIX}:${pl.jti}`,
            "1",
            "EX",
            15 * 60 // añadir a blacklist hasta que expire el access
          );
        }
      } catch {
        // Si el token ya está vencido/inválido, continuar
      }
    }
  }

  // 7.4.2 Revocar refresh eliminándolo de Redis
  if (rt && redisClient) {
    const decodedHeaderRT = jwt.decode(rt, { complete: true }) as any;
    const kidRT = decodedHeaderRT?.header?.kid;
    let keyToVerifyRT: Buffer | string | undefined;

    if (JWT_ALG === "HS256") {
      keyToVerifyRT = SECRET_KEY as string;
    } else {
      keyToVerifyRT = publicKeysByKid[kidRT];
    }

    if (keyToVerifyRT) {
      try {
        const pl = jwt.verify(rt, keyToVerifyRT, {
          algorithms: [JWT_ALG],
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }) as AppJwtPayload;
        if (pl?.jti) {
          await redisClient.del(`${REFRESH_WHITELIST_PREFIX}:${pl.jti}`);
        }
      } catch {
        // Si ya era inválido, nada más que hacer
      }
    }
  }

  // 7.4.3 Limpiar cookies (solo para paths indicados)
  res
    .clearCookie("accessToken", { path: "/api" })
    .clearCookie("refreshToken", { path: "/refresh" })
    .json({ message: "Logged out" });
});

// -----------------------------------------------------------------------------
// 8) TODO: Pruebas de penetración (Pentest) sugeridas
// -----------------------------------------------------------------------------
/*
 - Usa OWASP ZAP o Burp Suite para escanear:
   • /api/auth/login   → inyección, brute force, credential stuffing.
   • /api/auth/refresh → tampering, replay, expiration bypass.
   • /api/admin/*      → fuerza de rol (“role escalation”), bypass de rutas.
   • Verifica rechazo de JWT con alg=none, certifica que no acepte kid no configurado.
   • Prueba CSRF: intenta POST /api/auth/refresh desde un origen distinto.
 - Verifica XSS en tus frontends para asegurarte de que no puedan robar cookies HttpOnly.
 - Ejecuta `npm run audit` (Husky hook en package.json) antes de cada commit:
     * Se fallará si hay vulnerabilidades “high” o “critical” en dependencias.
 - Revisa logs de Redis para detectar intentos de uso de tokens revocados.
 - Para rotar llaves:
     1. Sube la nueva llave pública a tu servidor (p. ej. "new_pub.pem").
     2. Agrega `publicKeysByKid["nuevoKid"] = fs.readFileSync("ruta/a/new_pub.pem");`.
     3. Actualiza `JWT_KID = "nuevoKid"` en tus variables de entorno.
     4. Ahora los nuevos tokens se firmarán con "nuevoKid", los antiguos expiran naturalmente.

 Referencias:
 - OWASP JWT Cheat Sheet       → https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet_for_Java.html
 - NIST SP 800-63C             → https://pages.nist.gov/800-63-3/sp800-63c.html
 - PentesterLab JWT Exercises  → https://pentesterlab.com/exercises/jwt
 - PortSwigger JWT Academy     → https://portswigger.net/web-security/jwt
*/
// -----------------------------------------------------------------------------
// End of auth.middleware.ts
