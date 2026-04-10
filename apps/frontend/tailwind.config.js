/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'peach-soft': '#F7C5B2',
        'slate-gray': '#3E4A59',
        'clean-white': '#FFFFFF'
      }
    }
  },
  plugins: []
}
