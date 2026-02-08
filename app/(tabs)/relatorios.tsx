import { Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function RelatoriosScreen() {
  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Relatórios</Text>
          <Text className="text-base text-muted">
            Análise de desempenho por máquina e operador
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted text-center">
            Funcionalidade de relatórios em desenvolvimento
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
