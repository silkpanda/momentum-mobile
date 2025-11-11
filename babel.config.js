module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      // This preset is required for NativeWind v3 [cite: 65, 83]
      "nativewind/babel",
    ],
  };
};