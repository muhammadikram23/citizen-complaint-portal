/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Poppins"', '-apple-system', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          hover: 'rgb(var(--color-danger-hover) / <alpha-value>)',
          soft: 'rgb(var(--color-danger-soft) / <alpha-value>)',
        },
        'success-bg': 'rgb(var(--color-success-bg) / <alpha-value>)',
        'success-text': 'rgb(var(--color-success-text) / <alpha-value>)',
        civic: {
          DEFAULT: '#1e3a5f',
          hover: '#152b47',
          dark: '#0f1f33',
        },
      },
    },
  },
  plugins: [],
};
