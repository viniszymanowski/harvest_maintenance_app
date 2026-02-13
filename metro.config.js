const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite (web) uses a .wasm asset; ensure Metro treats it as an asset on web.
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

module.exports = withNativeWind(config, { input: "./global.css" });
