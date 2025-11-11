const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This wraps the default config and adds the NativeWind compiler.
// We must specify the 'input' as our global.css file[cite: 71, 93].
module.exports = withNativeWind(config, { input: "./global.css" });