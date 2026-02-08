import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

interface MachineStatus {
  maquinaId: string;
  operador: string | null;
  horasMotorDia: number | null;
  status: "completo" | "pendente";
}

export default function HomeScreen() {
  const router = useRouter();
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setTodayDate(formatted);
  }, []);

  const { data: dailyLogs, isLoading, refetch } = trpc.dailyLogs.getByDate.useQuery(
    { date: todayDate },
    { enabled: !!todayDate }
  );

  const machineStatuses: MachineStatus[] = ["M1", "M2", "M3", "M4"].map((maquinaId) => {
    const log = dailyLogs?.find((l) => l.maquinaId === maquinaId);
    return {
      maquinaId,
      operador: log?.operador || null,
      horasMotorDia: log?.horasMotorDia || null,
      status: log ? "completo" : "pendente",
    };
  });

  const handleNavigateToLancamento = () => {
    router.push("/(tabs)/lancamento" as any);
  };

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
          <Text className="text-3xl font-bold text-foreground">Controle de Colheita</Text>
          <Text className="text-base text-muted">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Machine Cards */}
        <FlatList
          data={machineStatuses}
          keyExtractor={(item) => item.maquinaId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(tabs)/lancamento?maquina=${item.maquinaId}` as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="bg-surface rounded-2xl p-5 mb-4 border border-border"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-bold text-foreground">{item.maquinaId}</Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.status === "completo" ? "bg-success" : "bg-warning"
                  }`}
                >
                  <Text className="text-xs font-semibold text-white">
                    {item.status === "completo" ? "Completo" : "Pendente"}
                  </Text>
                </View>
              </View>

              {item.operador ? (
                <View className="gap-1">
                  <Text className="text-sm text-muted">Operador</Text>
                  <Text className="text-base font-semibold text-foreground">{item.operador}</Text>
                  {item.horasMotorDia !== null && (
                    <>
                      <Text className="text-sm text-muted mt-2">Horas Motor Dia</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {item.horasMotorDia.toFixed(1)}h
                      </Text>
                    </>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-muted">Nenhum lançamento registrado</Text>
              )}
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable
              onPress={handleNavigateToLancamento}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              className="bg-primary rounded-2xl p-5 items-center justify-center mt-2"
            >
              <Text className="text-lg font-bold text-white">+ Novo Lançamento</Text>
            </Pressable>
          }
        />
      </View>
    </ScreenContainer>
  );
}
