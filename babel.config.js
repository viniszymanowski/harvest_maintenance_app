module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "nativewind/babel",
      "react-native-worklets/plugin",
      // IMPORTANTE: se usar Reanimated, ele deve ficar por último
      "react-native-reanimated/plugin",
    ],
  };
};
