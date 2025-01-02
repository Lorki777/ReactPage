import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Asegura que las rutas relativas funcionen
  build: {
    outDir: "dist", // Generar la salida en el directorio `dist`
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Puerto y esquema del backend
        changeOrigin: true, // Cambia el origen para evitar conflictos de CORS
      },
    },
  },
  css: {
    postcss: "./postcss.config.ts",
  },
});
