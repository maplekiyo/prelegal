import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b1629",
          light: "#162032",
          border: "#1e3050",
          hover: "#1a2d4a",
        },
        gold: {
          DEFAULT: "#c4993a",
          light: "#d4ae5a",
          dim: "#8a6a25",
        },
        parchment: {
          DEFAULT: "#f8f3e8",
          dark: "#ede4cd",
        },
        ink: {
          DEFAULT: "#1a1209",
          mid: "#3d3520",
          light: "#6b5d3e",
        },
        storm: "#7a90a8",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        document: ["var(--font-lora)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
