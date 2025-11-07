// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // FIX APPLIED: Use the correct internal package reference name, not a direct Git URL.
      'tailwindcss-react-native/babel', 
    ],
  };
};