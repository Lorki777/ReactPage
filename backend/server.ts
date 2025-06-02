// server.ts

import * as http from "http";
import app from "./app";

// ────────────────────────────────────────────────────────────────────────────────
// 1) Puerto que App Platform inyecta en producción. En local puedes usar 8080.
// ────────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// ────────────────────────────────────────────────────────────────────────────────
// 2) Levantar servidor HTTP que escuche en el puerto indicado
//    (App Platform se encargará de TLS)
// ────────────────────────────────────────────────────────────────────────────────
http.createServer(app).listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
