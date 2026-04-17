import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          dark: "#0d0a1a",
          purple: "#2d1b69",
          violet: "#7c3aed",
          gold: "#f59e0b",
          light: "#e9d5ff",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
      keyframes: {
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        flip: "flip 0.8s ease-in-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
