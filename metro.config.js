const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite (web) ships a .wasm file; Metro needs to treat it as an asset.
config.resolver.assetExts = Array.from(new Set([...(config.resolver.assetExts ?? []), "wasm"]));

module.exports = withNativeWind(config, { input: "./global.css" });
