// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      // Add Nativewind's Babel preset [cite: 821]
      "nativewind/babel",
    ],
  };
};