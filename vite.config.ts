import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Asegura que las rutas relativas funcionen
  build: {
    minify: "terser", // Usa Terser para minimizar el código
    outDir: "dist", // Generar la salida en el directorio `dist`
    terserOptions: {
      compress: {
        drop_console: true, // Elimina console.logs
        drop_debugger: true, // Elimina debuggers
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Puerto y esquema del backend
        changeOrigin: true, // Cambia el origen para evitar conflictos de CORS
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    headers: {
      "Content-Security-Policy":
        "default-src 'self' https://gso.kommo.com; script-src 'self' 'unsafe-inline' https://gso.kommo.com; frame-src 'self' https://gso.kommo.com; img-src 'self' data: https://gso.kommo.com;",
    },
  },
  css: {
    postcss: "./postcss.config.ts",
  },
});
