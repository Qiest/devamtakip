/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F1B2D',
        mist: '#EEF2F7',
        brand: { DEFAULT: '#1F3C88', dark: '#162C66' },
        ok: '#16875F',
        warn: '#A8650A',
        bad: '#C93C3C',
      },
      fontFamily: {
        sans: ['ui-rounded', '"SF Pro Rounded"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
