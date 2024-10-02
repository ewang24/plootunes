
const path = require('path');

// const workspaceRoot = path.resolve(__dirname, '../');
// const projectRoot = __dirname;

// config.watchFolders = [path.resolve(__dirname, '../../core')];
// config.resolver = {sourceExts: ['ts']};

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModues = {
        core: path.resolve(__dirname, '../../core')
}

const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];

config.resolver.nodeModulesPaths = nodeModulesPaths;

config.watchFolders.push(path.resolve(__dirname, '../../core'))

module.exports = config;
// module.exports = {
//     ...config,
//     resolver: {
//         sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs'],
//         assetExts: ['png', 'jpg', 'jpeg', 'svg', 'gif', 'otf', 'ttf', 'woff', 'woff2'],
//     },
//     watchFolders: [
//         // Adjust this path to your actual structure
//         path.resolve(__dirname, '../../core'),
//         path.resolve(__dirname, 'node_modules'),
//     ]
//     // resolver: {
//     //     nodeModulePaths: [
//     //         path.resolve(projectRoot, 'node_modules/**/*'),
//     //         path.resolve(workspaceRoot, 'node_modules/**/*'),
//     //     ]
//     // }
// };