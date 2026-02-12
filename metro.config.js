// metro.config.js (Windows-safe / CommonJS)
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Se você estiver usando NativeWind com global.css no Expo Router,
// isso ajuda o Metro a aceitar CSS no web sem dar pau.
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "cjs",
];

module.exports = config;
