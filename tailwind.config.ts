import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#fff8fc",
        foreground: "#171217",
        cream: "#f7eaf3",
        cocoa: "#65004d",
        gold: "#c8a45d",
        nude: "#c184a8",
        blush: "#c184a8",
        mauve: "#b97ca2",
        plum: "#65004d",
        ink: "#171217",
        muted: "#5f5360"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(101, 0, 77, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
