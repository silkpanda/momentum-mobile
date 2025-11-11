/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind/NativeWind where to look for our class names
  // We must include all files that will use Tailwind styles [cite: 46]
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  
  // This preset is required to make Tailwind utilities work in React Native [cite: 48]
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      // 1. FONT FAMILY
      // As per Governance Doc (Section 4), we are using Inter 
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },

      // 2. SEMANTIC COLOR ROLES (THEME API)
      // This is the v3 implementation of our "Theme API" [cite: 1284]
      // Sourced from the "Calm Light" default theme [cite: 1289]
      colors: {
        // 2a. Backgrounds
        "bg-canvas": "#F9FAFB", // [cite: 1013, 1290]
        "bg-surface": "#FFFFFF", // [cite: 1013, 1291]
        
        // 2b. Text
        "text-primary": "#111827",   // [cite: 1292]
        "text-secondary": "#4B5563", // [cite: 1293]

        // 2c. Borders
        "border-subtle": "#E5E7EB", // [cite: 1294]

        // 2d. Actions
        "action-primary": "#4F46E5",     // [cite: 1013, 1295]
        "action-hover": "#4338CA",       // (Derived from Indigo-700) [cite: 1296]

        // 2e. Signals
        "signal-success": "#16A34A", // [cite: 1013, 1297]
        "signal-alert": "#DC2626",   // [cite: 1013, 1298]
        "signal-focus": "#FACC15",   // [cite: 1299]

        // 3. USER PROFILE COLORS
        // Mandatory palette for family member profiles 
        "profile-blueberry": "#4285F4",
        "profile-celtic-blue": "#1967D2",
        "profile-selective-yellow": "#FBBC04",
        "profile-pigment-red": "#F72A25",
        "profile-sea-green": "#34A853",
        "profile-dark-spring-green": "#188038",
        "profile-tangerine": "#FF8C00",
        "profile-grape": "#8E24AA",
        "profile-flamingo": "#E67C73",
        "profile-peacock": "#039BE5",
      },
    },
  },
  plugins: [],
};