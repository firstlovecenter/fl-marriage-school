/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        gold: '#B8955A',
        deep: '#1C1612',
        'male-bg': '#EDF4F9',
        'male-accent': '#4A7FA0',
        'female-bg': '#F9EDF4',
        'female-accent': '#A04A7F',
        success: '#2A6B4A',
        error: '#9B3A2A',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
