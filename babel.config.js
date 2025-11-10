// babel.config.js
// This configuration is simplified for NativeWind v5.
// We MUST remove the 'nativewind/babel' preset as it's replaced
// by the new Import Rewrites system[cite: 919, 1010].
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Only retain 'babel-preset-expo'
      "babel-preset-expo",
    ],
  };
};