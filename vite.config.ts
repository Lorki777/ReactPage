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
      format: {
        comments: false, // Elimina todos los comentarios
      },
    },
  },
  server: {
    host: "localhost", // 🔹 Asegura que use localhost en dev
    port: 5173, // 🔹 Asegura que corre en el puerto correcto
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  css: {
    postcss: "./postcss.config.ts",
  },
});
