/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#060a14",
          soft: "#0d1526",
          card: "#0f1a2e",
          border: "#1a2d4d",
        },
        electric: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffe",
          300: "#7cc4fd",
          400: "#36a5f9",
          500: "#0d87f0",
          600: "#0166cf",
          700: "#0253a8",
          800: "#064689",
          900: "#0b3c71",
        },
        neon: {
          DEFAULT: "#00e5a0",
          dim: "#00c488",
          glow: "rgba(0,229,160,0.15)",
        },
        gold: "#f5c842",
        rose: "#ff4f7b",
        sky: "#38bdf8",
        violet: "#a78bfa",
        coral: "#ff6b6b",
        amber: "#fbbf24",
      },
      animation: {
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "pop": "pop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        pop: {
          "0%": { transform: "scale(0.94)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,229,160,0.25)",
        electric: "0 0 20px rgba(13,135,240,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
