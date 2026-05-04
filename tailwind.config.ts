import type { Config } from "tailwindcss";

/**
 * Tailwind v4: design tokens and `@theme` live in `app/globals.css`.
 * This file keeps the official content globs in one place for tooling.
 */
export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./features/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
    "./providers/**/*.{ts,tsx,mdx}",
  ],
} satisfies Config;
