import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
// Eliminamos PurgeCSS en desarrollo y lo configuramos bien en producción
import purgecss from "@fullhuman/postcss-purgecss";

const isProduction = process.env.NODE_ENV === "production";

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    isProduction
      ? purgecss({
          content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"], // Archivos a analizar
          defaultExtractor: (content: string) =>
            content.match(/[\w-/:]+(?<!:)/g) || [],
          safelist: {
            standard: [
              /^swiper-/,
              /^bootstrap-/,
              /^btn-/,
              /^alert-/,
              /^bg-/,
              /^text-/,
              /^border-/,
              /^hover:bg-/,
              /^p-/,
              /^m-/,
              /^flex-/,
              /^grid-/,
              /^gap-/,
              /^amo-/,
              /^buttonscollapsed/,
              /^amo-inner-buttons/,
            ], // Excluye clases dinámicas de Tailwind
          },
        })
      : null, // No usamos PurgeCSS en desarrollo
  ].filter(Boolean), // Filtra plugins vacíos para evitar errores
};
