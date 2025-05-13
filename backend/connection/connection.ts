import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 20000,
  /*ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT, // Add CA certificate for stricter validation
  }, */
});
