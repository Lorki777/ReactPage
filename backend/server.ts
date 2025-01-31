import * as http from "http";
//import fs from "fs";
import app from "./app"; // Usa `app` desde `app.ts`

// Opciones HTTPS
// const options = {
//   key: fs.readFileSync(
//     "C:/Users/rbai1/Downloads/nginx-1.26.2/conf/certificates/localhost-key.pem"
//   ),
//   cert: fs.readFileSync(
//     "C:/Users/rbai1/Downloads/nginx-1.26.2/conf/certificates/localhost.pem"
//   ),
// };

// Servidor HTTP
http.createServer(app).listen(8080, () => {
  console.log("Servidor HTTPS escuchando en http://localhost:8080");
});
