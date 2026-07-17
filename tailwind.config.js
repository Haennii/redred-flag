/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B1120',
          secondary: '#111827',
          card: '#1A2235',
        }
      }
    },
  },
  plugins: [],
}
