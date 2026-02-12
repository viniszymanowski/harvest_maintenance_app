module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "nativewind/babel",
      // ✅ deixe APENAS 1 vez:
      "react-native-worklets/plugin",
    ],
  };
};
