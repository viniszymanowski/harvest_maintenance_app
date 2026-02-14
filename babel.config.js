module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    // IMPORTANT: "react-native-reanimated/plugin" MUST be last.
    plugins: ["nativewind/babel", "react-native-reanimated/plugin"],
  };
};
