import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

export default function RegistrosScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const utils = trpc.useUtils();

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setSelectedDate(formatted);
  }, []);

  const { data: dailyLogs, isLoading } = trpc.dailyLogs.getByDate.useQuery(
    { date: selectedDate },
    { enabled: !!selectedDate }
  );

  const deleteMutation = trpc.dailyLogs.delete.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.dailyLogs.getByDate.invalidate();
      Alert.alert("Sucesso", "Registro excluído com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const handleDelete = (id: string) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente excluir este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id }),
      },
    ]);
  };

  const machineRecords = ["M1", "M2", "M3", "M4"].map((maquinaId) => {
    const log = dailyLogs?.find((l) => l.maquinaId === maquinaId);
    return { maquinaId, log };
  });

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-6">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Registros do Dia</Text>
          <Text className="text-base text-muted">Visualize e gerencie os lançamentos</Text>
        </View>

        {/* Date Selector */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted">Selecione a Data</Text>
          <TextInput
            value={selectedDate}
            onChangeText={setSelectedDate}
            className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Machine Records */}
        <FlatList
          data={machineRecords}
          keyExtractor={(item) => item.maquinaId}
          renderItem={({ item }) => (
            <View className="bg-surface rounded-2xl p-5 mb-4 border border-border">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-bold text-foreground">{item.maquinaId}</Text>
                {item.log && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => router.push(`/editar-lancamento?id=${item.log!.id}`)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="bg-primary/20 p-2 rounded-lg"
                    >
                      <IconSymbol name="pencil" size={20} color="#10B981" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(item.log!.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="bg-error/20 p-2 rounded-lg"
                    >
                      <IconSymbol name="trash" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                )}
              </View>

              {item.log ? (
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">Operador</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {item.log.operador}
                    </Text>
                  </View>

                  {item.log.horasMotorDia !== null && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Horas Motor Dia</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {item.log.horasMotorDia.toFixed(1)}h
                      </Text>
                    </View>
                  )}

                  {item.log.horasTrilhaDia !== null && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Horas Trilha Dia</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {item.log.horasTrilhaDia.toFixed(1)}h
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">Prod / Man / Chuva</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {item.log.prodH.toFixed(1)}h / {item.log.manH.toFixed(1)}h /{" "}
                      {item.log.chuvaH.toFixed(1)}h
                    </Text>
                  </View>

                  {item.log.areaHa !== null && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Área</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {item.log.areaHa.toFixed(1)} ha
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">Abasteceu</Text>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        item.log.abasteceu ? "bg-success" : "bg-muted"
                      }`}
                    >
                      <Text className="text-xs font-semibold text-white">
                        {item.log.abasteceu ? "Sim" : "Não"}
                      </Text>
                    </View>
                  </View>

                  {item.log.atrasoMin !== null && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Atraso</Text>
                      <Text
                        className={`text-base font-semibold ${
                          item.log.atrasoMin <= 5 ? "text-success" : "text-warning"
                        }`}
                      >
                        {item.log.atrasoMin} min
                      </Text>
                    </View>
                  )}

                  {item.log.divergente && (
                    <View className="p-2 rounded-lg bg-warning/20">
                      <Text className="text-xs font-semibold text-warning text-center">
                        ⚠️ Divergente
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-muted text-center py-4">
                  Nenhum registro para esta data
                </Text>
              )}
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}
