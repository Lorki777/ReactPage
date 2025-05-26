// postcss.config.mjs
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import purgecss from "@fullhuman/postcss-purgecss";
import cssnano from "cssnano";

const isProduction = process.env.NODE_ENV === "production";

// Construimos dinámicamente el objeto de plugins
const plugins = {
  // Plugin oficial de Tailwind para PostCSS
  "@tailwindcss/postcss": {},
  // Añade prefijos para compatibilidad con navegadores
  autoprefixer: {},
};

if (isProduction) {
  // En producción, eliminamos CSS no usado
  plugins["@fullhuman/postcss-purgecss"] = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
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
      ],
    },
  };

  // Minificación y eliminación de comentarios
  plugins["cssnano"] = {
    preset: [
      "default",
      {
        discardComments: { removeAll: true },
      },
    ],
  };
}

export default {
  plugins,
};
