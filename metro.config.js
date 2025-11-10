// metro.config.js
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Wrap the Expo config and specify the CSS input file [cite: 827]
module.exports = withNativeWind(config, { 
  input: './global.css',
  // Note: This is for Tailwind v4. 
  // For v3 you'd set tailwindConfig: './tailwind.config.js'
});