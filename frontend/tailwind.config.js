/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aiesec: {
          blue: '#007BFF',
          orange: '#F85A2A',
          light: '#F5F7FA',
          dark: '#1C1C1C',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
