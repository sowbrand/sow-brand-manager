/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sow-green': '#72bf03',
        'sow-dark': '#545454',
        'sow-black': '#000000',
      }
    },
  },
  plugins: [],
}