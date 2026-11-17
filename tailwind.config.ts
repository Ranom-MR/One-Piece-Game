import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pirate: {
          dark: "#0f172a",
          darker: "#090d16",
          parchment: "#f8f4e5",
          parchmentDark: "#e5dcbe",
          gold: "#f59e0b",
          goldDark: "#d97706",
          red: "#ef4444",
          redDark: "#b91c1c",
          sea: "#0ea5e9",
          seaDark: "#0369a1",
          wood: "#78350f",
          woodDark: "#451a03",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
