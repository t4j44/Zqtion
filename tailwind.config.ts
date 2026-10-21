import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Existing white/black opacity utilities now follow the active surface.
        white: 'rgba(var(--ink-rgb), <alpha-value>)',
        black: 'rgba(var(--canvas-rgb), <alpha-value>)',
        foreground: 'var(--foreground)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-tertiary)',
        surface: 'var(--surface)',
        raised: 'var(--surface-raised)',
        accent: 'var(--cyan)',
        error: 'var(--error)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        'accent-soft': 'var(--accent-soft)',
        'zqtion-black': '#050505',
        'zqtion-blue': '#0B63FF',
        electric: "#0B63FF", // Keeping for backward compatibility
      },
      fontFamily: {
        sans: ['var(--font-instrument-sans)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
