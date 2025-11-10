// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require('nativewind/metro');

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Wrap the default config with withNativewind
// We must explicitly pass the 'input' path to our global.css file[cite: 909].
module.exports = withNativewind(config, { input: './global.css' });