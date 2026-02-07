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
        // St. Elias Orthodox Church branding
        primary: {
          50: "#e8eef5",
          100: "#c5d5e8",
          200: "#9fb9d8",
          300: "#7a9dc7",
          400: "#5a82b5",
          500: "#3b679e",
          600: "#2d5280",
          700: "#1e3a5f",
          800: "#162c49",
          900: "#0f1f33",
        },
        accent: {
          50: "#fdf8ed",
          100: "#f9eece",
          200: "#f2dca0",
          300: "#e8c56e",
          400: "#d4a84a",
          500: "#b8860b",
          600: "#9a7009",
          700: "#7a5a07",
          800: "#5c4305",
          900: "#3d2c03",
        },
        wine: {
          50: "#faf0f1",
          100: "#f2d6d9",
          200: "#e5adb3",
          300: "#d0808a",
          400: "#a75460",
          500: "#8b3a45",
          600: "#722f37",
          700: "#5c252d",
          800: "#4a1f24",
          900: "#38171b",
        },
        sage: {
          50: "#f0f4ed",
          100: "#dae3d4",
          200: "#bfcfb5",
          300: "#a3b896",
          400: "#7f9c6e",
          500: "#5a7247",
          600: "#4a5f3b",
          700: "#3d4e30",
          800: "#2f3c25",
          900: "#222b1b",
        },
        cream: "#faf8f5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        display: ["var(--font-eb-garamond)", "Georgia", "serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
export default config;
