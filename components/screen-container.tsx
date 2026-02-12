import { View, SafeAreaView, Platform } from "react-native";

export function ScreenContainer({ children, className = "", style }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View
        className={`flex-1 bg-background ${Platform.OS === "web" ? "px-6" : "px-4"} ${className}`}
        style={style}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
