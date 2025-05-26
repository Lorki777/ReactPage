import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

// Ya no importamos tailwindcss aquí ni ningún plugin PostCSS

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    react(),
    // elimina tailwindcss() si lo tenías aquí
  ],
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
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  css: {
    // Ahora solo apuntamos a nuestro postcss.config.ts
    postcss: "./postcss.config.mjs",
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
});
