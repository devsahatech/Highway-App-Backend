/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        amber: {
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        gray: {
          100: '#F3F4F6',
          700: '#374151',
          800: '#1F2937',
        },
        cream: {
          DEFAULT: '#FFFBEB'
        }
      }
    },
  },
  plugins: [],
}
