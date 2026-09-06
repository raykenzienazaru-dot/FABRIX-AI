import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#F7FAF8",
        surface: "#FFFFFF",
        surface2: "#EEF5F0",
        border: "#D7E3DA",
        ink: "#051F20",
        muted: "#587068",
        deep: "#051F20",
        dark: "#0B2B26",
        primary: "#163832",
        secondary: "#235347",
        sage: "#8EB69B",
        pale: "#DAF1DE",
        gold: "#235347",
        goldSoft: "#8EB69B",
        teal: "#235347",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        weave:
          "repeating-linear-gradient(45deg, rgba(35,83,71,0.045) 0px, rgba(35,83,71,0.045) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(-45deg, rgba(142,182,155,0.06) 0px, rgba(142,182,155,0.06) 1px, transparent 1px, transparent 16px)",
      },
      boxShadow: {
        card: "0 8px 30px rgba(5, 31, 32, 0.06)",
        cardHover: "0 16px 40px rgba(5, 31, 32, 0.11)",
      },
    },
  },
  plugins: [],
};

export default config;
