// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this to include the paths to all files that contain Nativewind classes.
  // This is a mandatory step.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  
  // This preset is mandatory for NativeWind to function.
  presets: [require("nativewind/preset")],
  
  theme: {
    extend: {},
  },
  plugins: [],
}