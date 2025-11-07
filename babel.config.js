// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // FIX APPLIED: Use the correct internal package reference name, not a direct Git URL.
      // FIX APPLIED: Explicitly specify the path to the CSS-first configuration file 
      // NEW FIX: Exclude the tailwind config CSS file from Babel processing to prevent 
      // the synchronous/asynchronous plugin conflict and resolve the TransformError 500.
      [
        'tailwindcss-react-native/babel', 
        {
          tailwindConfig: './src/styles/tailwind.css',
          // CRITICAL: Exclude the config file itself from being processed as JS/TS content
          // This prevents the TransformError 500.
          exclude: ['./src/styles/tailwind.css'], 
        },
      ],
    ],
  };
};