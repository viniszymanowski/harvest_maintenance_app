module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "nativewind/babel",
      // se você REALMENTE usa react-native-worklets:
      "react-native-worklets/plugin",
      // reanimated SEMPRE por último
      "react-native-reanimated/plugin",
    ],
  };
};
