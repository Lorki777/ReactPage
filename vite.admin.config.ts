import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: "src/admin-app",
  base: "./",
  build: {
    outDir: "../../admin-dist",
    emptyOutDir: true,
    minify: "terser",
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
      format: { comments: false },
    },
  },
  server: {
    host: "localhost",
    port: 5174,
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
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
});
