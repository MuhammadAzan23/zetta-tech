import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#031A3B", 900: "#05224C", 800: "#0B3068", 700: "#16407F" },
        cyan: { brand: "#36CDFF", soft: "#CFF1FF", deep: "#0A8DBD" },
        paper: "#F4F6F9",
        ice: "#EAF1F8",
        ink: "#0A1A33",
      },
      fontFamily: {
        display: ["Bricolage Grotesque Variable", "system-ui", "sans-serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
