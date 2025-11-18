/** @type {import('tailwindcss').Config} */
module.exports = {
  // FIX: Added './app/**/*.{js,jsx,ts,tsx}' so Tailwind scans your screens
  content: [
    './app/**/*.{js,jsx,ts,tsx}', 
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};