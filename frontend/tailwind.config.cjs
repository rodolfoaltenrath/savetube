/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "../templates/**/*.html",
    "./src/**/*.{vue,js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          save: "#2563eb",
          tube: "#ef4444"
        }
      },
      borderRadius: {
        'xl2': '1.25rem'
      }
    }
  },
  plugins: []
}
