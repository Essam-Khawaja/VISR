import type { Config } from "tailwindcss";

function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        card: "var(--bg-card)",

        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },

        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          strong: "var(--accent-strong)",
          glow: "var(--accent-glow)",
        },
        accent2: {
          DEFAULT: "var(--accent-2)",
          soft: "var(--accent-2-soft)",
        },

        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
          glow: "var(--danger-glow)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          soft: "var(--muted-soft)",
        },

        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",

        cream: withOpacity("--cream-rgb"),
        amaranth: withOpacity("--amaranth-rgb"),
        thulian: withOpacity("--thulian-rgb"),
        brook: withOpacity("--brook-rgb"),
        chalk: withOpacity("--chalk-rgb"),
        pomelo: withOpacity("--pomelo-rgb"),
        sage: withOpacity("--sage-rgb"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        lift: "var(--shadow-lg)",
        focus: "var(--shadow-focus)",
      },
      letterSpacing: {
        widest: "0.12em",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        soft: "cubic-bezier(0.32, 0.72, 0.24, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        "soft-pulse": "soft-pulse 2.2s ease-in-out infinite",
        "fade-up": "fade-up 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
