import { ActivityIndicator, View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface LoadingSpinnerProps {
  text?: string;
  size?: "small" | "large";
}

export function LoadingSpinner({ text = "Carregando...", size = "large" }: LoadingSpinnerProps) {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size={size} color={colors.primary} />
      {text && (
        <Text className="text-muted mt-4 text-center">{text}</Text>
      )}
    </View>
  );
}
