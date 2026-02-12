// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolver para ignorar expo-sqlite na web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Ignorar expo-sqlite/web na plataforma web
    if (platform === 'web' && moduleName.includes('expo-sqlite')) {
      return {
        type: 'empty',
      };
    }
    
    // Default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
