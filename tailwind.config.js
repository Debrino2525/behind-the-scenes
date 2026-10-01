/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bts: {
          dark: '#0e1015',
          card: '#161922',
          cardLight: '#1f2430',
          accent: '#FFB800', // Warm Ghanaian Gold
          red: '#E03638',    // Kente / Flag Red
          green: '#008751',  // Emerald Green
          soft: '#A1A8B8',
          border: '#2a3142'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
