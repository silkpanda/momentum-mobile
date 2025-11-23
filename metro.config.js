const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the parent directory (to include momentum-shared)
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve 'momentum-shared' to the local source directory
// This ensures it's treated as source code and compiled, rather than a pre-built node_module
config.resolver.extraNodeModules = {
    'momentum-shared': path.resolve(workspaceRoot, 'momentum-shared'),
    ...config.resolver.extraNodeModules,
};

module.exports = config;
