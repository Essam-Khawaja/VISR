import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "#080C14",
        surface: "#0D1424",
        elevated: "#111827",
        border: "#1A2640",
        accent: "#4FACFE",
        danger: "#FF4D6D",
        success: "#00F5A0",
        warning: "#FFB547",
        muted: "#3D4F6B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui"],
      },
      boxShadow: {
        accent: "0 0 32px rgba(79, 172, 254, 0.2)",
      },
    },
  },
  plugins: [],
} satisfies Config;
