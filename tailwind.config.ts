import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F3EF",
        surface: "#FFFFFF",
        "surface-muted": "#EBE8E1",
        ink: "#111111",
        "brand-green": "#00FF66",
        "brand-yellow": "#FFD028",
        "brand-red": "#FF4336",
        "brand-orange": "#FF8A00",
        "brand-pink": "#FFAEC9",
        "brand-cyan": "#70D6FF",
        "brand-purple": "#BDB2FF",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "hard-xs": "1.5px 1.5px 0px #111111",
        "hard-sm": "2px 2px 0px #111111",
        "hard-md": "4px 4px 0px #111111",
        "hard-lg": "6px 6px 0px #111111",
        "hard-xl": "8px 8px 0px #111111",
        "hard-2xl": "12px 12px 0px #111111",
        "hard-green": "4px 4px 0px #00FF66",
        "hard-red": "4px 4px 0px #FF4336",
        "hard-yellow": "4px 4px 0px #FFD028",
        "hard-cyan": "4px 4px 0px #70D6FF",
      },
      borderWidth: {
        "2.5": "2.5px",
        "3": "3px",
        "4": "4px",
      },
      animation: {
        "marquee": "marquee 25s linear infinite",
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
