import { Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function ManutencaoScreen() {
  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Manutenção</Text>
          <Text className="text-base text-muted">
            Gerencie manutenções e peças das máquinas
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted text-center">
            Funcionalidade de manutenção em desenvolvimento
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
