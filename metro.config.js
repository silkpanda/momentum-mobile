const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// momentum-shared will be installed from GitHub into node_modules
// Metro will handle it automatically
module.exports = config;
