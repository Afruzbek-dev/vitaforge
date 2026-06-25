import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        sidebar: "var(--sidebar)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        "accent-border": "var(--accent-border)",
        vtext: "var(--text)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        vred: "var(--red)",
        vgreen: "var(--green)",
        vblue: "var(--blue)",
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
