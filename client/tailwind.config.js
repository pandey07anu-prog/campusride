/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#c7cdc9',
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
        },
        dark: {
          950: '#0B0F17',
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
        }
      },
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
        heading: ['Archivo', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
