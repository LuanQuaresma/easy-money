import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        income: "var(--color-income)",
        expense: "var(--color-expense)",
        pending: "var(--color-pending)",
        investment: "var(--color-investment)",
      },
    },
  },
  plugins: [],
};

export default config;
