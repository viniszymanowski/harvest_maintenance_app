const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// MUITO IMPORTANTE: aponte para o seu global.css da raiz
module.exports = withNativewind(config, { input: "./global.css" });
