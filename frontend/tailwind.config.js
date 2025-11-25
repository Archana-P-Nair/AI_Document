/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom color palette
        cream: {
          50: '#FAF7F2',
          100: '#F3EADB',  // Main background
          200: '#E8D5BE',
          300: '#DCC0A1',
          400: '#D1AB84',
          500: '#C59667',
        },
        bronze: {
          400: '#D4A574',
          500: '#C79B61',  // Main button color
          600: '#B8865A',
          700: '#A67752',
        },
        mustard: {
          400: '#EDB942',
          500: '#E6AF2E',  // Accent color
          600: '#D19E28',
        },
      },
    },
  },
  plugins: [],
}