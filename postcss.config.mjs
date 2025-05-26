// postcss.config.mjs
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import purgecss from "@fullhuman/postcss-purgecss";
import cssnano from "cssnano";

const isProduction = process.env.NODE_ENV === "production";

export default {
  plugins: {
    // 1) Plugin oficial de Tailwind CSS v4 para PostCSS
    "@tailwindcss/postcss": {},

    // 2) Autoprefixer para compatibilidad entre navegadores
    autoprefixer: {},

    // 3) Sólo en producción, eliminamos CSS no usado
    ...(isProduction
      ? {
          "@fullhuman/postcss-purgecss": {
            content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
              standard: [
                /^styles_/,
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
                // Asegura que no se purguen variantes dark:
                /^dark:/,
              ],
            },
          },

          // 4) Minificación y eliminación de comentarios con cssnano
          cssnano: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }
      : {}),
  },
};
