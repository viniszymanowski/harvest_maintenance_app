import { useColorScheme } from "react-native";
import { themeColors } from "../theme.config";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof themeColors
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return themeColors[colorName][theme];
  }
}
