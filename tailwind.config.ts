import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        sub: "rgb(var(--sub) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        lbg: "rgb(var(--l-bg) / <alpha-value>)",
        lfg: "rgb(var(--l-fg) / <alpha-value>)",
        lsub: "rgb(var(--l-sub) / <alpha-value>)",
        lglass: "rgb(var(--l-glass) / <alpha-value>)",
        acc1: "#7C5CFF",
        acc2: "#22D3EE",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
