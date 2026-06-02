import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07070a",
        surface: "#0e0e14",
        card: "#13131c",
        border: "#1e1e2c",
        accent: "#e8ff47",
        "accent-dim": "#e8ff4712",
        "accent-border": "#e8ff4735",
        vtext: "#efefeb",
        muted: "#52526a",
        subtle: "#1a1a26",
        vred: "#ff5252",
        vgreen: "#4dffb4",
        vblue: "#5299ff",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
