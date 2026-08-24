/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#3D2200",
          50: "#FAF4EE",
          100: "#F0E0CC",
          200: "#E0C29A",
          300: "#C99B5C",
          400: "#A9743A",
          500: "#7A4D1F",
          600: "#5C3711",
          700: "#3D2200",
          800: "#2B1800",
          900: "#1A0E00",
        },
        brass: {
          DEFAULT: "#FF6B00",
          50: "#FFF3E9",
          100: "#FFE3CC",
          200: "#FFC79A",
          300: "#FFA968",
          400: "#FF8A3D",
          500: "#FF6B00",
          600: "#E85F00",
          700: "#B84C00",
          800: "#8A3900",
        },
        parchment: {
          DEFAULT: "#FAFAF8",
          50: "#FFFFFF",
          100: "#FCFBF9",
          200: "#F5F3EE",
          300: "#EDE9E0",
        },
        clover: "#3F6C51",
        rust: "#A13D3D",
      },
      fontFamily: {
        display: ["'Inter'", "'Segoe UI'", "Roboto", "Helvetica", "Arial", "sans-serif"],
        sans: ["'Inter'", "'Segoe UI'", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,61,0.06), 0 4px 14px rgba(20,33,61,0.06)",
        cardHover: "0 4px 10px rgba(20,33,61,0.08), 0 10px 28px rgba(20,33,61,0.10)",
      },
      backgroundImage: {
        "spine-texture":
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 26px)",
      },
    },
  },
  plugins: [],
};