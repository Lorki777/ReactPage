/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/admin-app/index.html",
    "./src/admin-app/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { outfit: ["Outfit", "sans-serif"] },
    },
  },
  plugins: [],
};
