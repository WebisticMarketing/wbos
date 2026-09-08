/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        navy: {
          900: "#0a1628",
        },
        brand: {
          blue: "#0068e3",
          light: "#00b8fd",
          teal: "#00d6f7",
        },
      },
    },
  },
  plugins: [],
};