import purgecss from "@fullhuman/postcss-purgecss";

export default {
  plugins: [
    require("autoprefixer"),
    purgecss({
      content: ["./index.html", "./src/**/*.{ts,tsx,html}"], // Rutas de componentes y HTML
      defaultExtractor: (content: string) =>
        content.match(/[\w-/:]+(?<!:)/g) || [], // Extrae todas las clases utilizadas
      safelist: {
        standard: [/^btn-/, /^alert-/], // Excluye clases dinámicas si usas patrones específicos
      },
    }),
  ],
};
