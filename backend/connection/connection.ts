import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

interface PoolConfig extends mysql.PoolOptions {}

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 20000,
};

if (process.env.NODE_ENV === "production") {
  poolConfig.ssl = {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT!,
  };
}

export const pool = mysql.createPool(poolConfig);
