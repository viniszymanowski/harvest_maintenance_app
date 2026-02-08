import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

interface MachineStatus {
  maquinaId: string;
  nome: string | null;
  operador: string | null;
  horasMotorDia: number | null;
  status: "completo" | "pendente";
  needsOilChange?: boolean;
  needs50hRevision?: boolean;
  currentHm?: number | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setTodayDate(formatted);
  }, []);

  const { data: machines } = trpc.machines.list.useQuery();
  const { data: dailyLogs, isLoading } = trpc.dailyLogs.getByDate.useQuery(
    { date: todayDate },
    { enabled: !!todayDate }
  );
  const { data: dailyReport } = trpc.reports.daily.useQuery(
    { date: todayDate },
    { enabled: !!todayDate }
  );

  // Buscar status de manutenção para M1, M2, M3, M4 (queries fixas)
  const m1Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M1" });
  const m2Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M2" });
  const m3Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M3" });
  const m4Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M4" });

  const maintenanceStatusMap: Record<string, any> = {
    M1: m1Status.data,
    M2: m2Status.data,
    M3: m3Status.data,
    M4: m4Status.data,
  };

  const machineStatuses: MachineStatus[] = (machines || []).map((machine) => {
    const log = dailyLogs?.find((l) => l.maquinaId === machine.id);
    const maintenanceStatus = maintenanceStatusMap[machine.id];
    
    return {
      maquinaId: machine.id,
      nome: machine.nome,
      operador: log?.operador || null,
      horasMotorDia: log?.horasMotorDia || null,
      status: log ? "completo" : "pendente",
      needsOilChange: maintenanceStatus?.needsOilChange || false,
      needs50hRevision: maintenanceStatus?.needs50hRevision || false,
      currentHm: maintenanceStatus?.currentHm || null,
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
        {/* Header - Otimizado para Tablet */}
        <View className="gap-3">
          <Text className="text-4xl font-bold text-foreground">Controle de Colheita</Text>
          <Text className="text-base text-muted">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* KPIs Dashboard */}
        {dailyReport && (
          <View className="gap-3">
            <View className="flex-row gap-3">
              {/* Máquinas Ativas */}
              <View className="flex-1 bg-primary/10 rounded-2xl p-6 border-2 border-primary/30 shadow-sm">
                <Text className="text-3xl font-bold text-primary">
                  {dailyReport.maquinasOperando}
                </Text>
                <Text className="text-sm text-muted mt-2">Máquinas Ativas</Text>
              </View>

              {/* Horas Produtivas */}
              <View className="flex-1 bg-success/10 rounded-2xl p-6 border-2 border-success/30 shadow-sm">
                <Text className="text-3xl font-bold text-success">
                  {dailyReport.totalHorasProd.toFixed(1)}h
                </Text>
                <Text className="text-sm text-muted mt-2">Horas Produtivas</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              {/* Área Colhida */}
              <View className="flex-1 bg-warning/10 rounded-2xl p-6 border-2 border-warning/30 shadow-sm">
                <Text className="text-3xl font-bold text-warning">
                  {dailyReport.totalArea.toFixed(1)} ha
                </Text>
                <Text className="text-sm text-muted mt-2">Área Colhida Hoje</Text>
              </View>

              {/* Eficiência Média */}
              <View className={`flex-1 rounded-2xl p-6 border-2 shadow-sm ${
                dailyReport.eficienciaMedia >= 70 
                  ? "bg-success/10 border-success/20" 
                  : "bg-error/10 border-error/20"
              }`}>
                <Text className={`text-3xl font-bold ${
                  dailyReport.eficienciaMedia >= 70 ? "text-success" : "text-error"
                }`}>
                  {dailyReport.eficienciaMedia.toFixed(0)}%
                </Text>
                <Text className="text-sm text-muted mt-2">Eficiência Média</Text>
              </View>
            </View>
          </View>
        )}

        {/* Machine Cards */}
        <FlatList
          data={machineStatuses}
          keyExtractor={(item) => item.maquinaId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(tabs)/lancamento?maquina=${item.maquinaId}` as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="bg-surface rounded-2xl p-6 mb-4 border-2 border-border shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-3xl font-bold text-foreground">{item.maquinaId}</Text>
                  <Text className="text-base text-muted mt-1">{item.nome || "Sem nome"}</Text>
                </View>
                <View
                  className={`px-4 py-2 rounded-full ${
                    item.status === "completo" ? "bg-success" : "bg-warning"
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {item.status === "completo" ? "Completo" : "Pendente"}
                  </Text>
                </View>
              </View>

              <View className="gap-2">
                {item.operador ? (
                  <View className="gap-1">
                    <Text className="text-base text-muted">Operador</Text>
                    <Text className="text-lg font-semibold text-foreground">{item.operador}</Text>
                    {item.horasMotorDia !== null && (
                      <>
                        <Text className="text-base text-muted mt-2">Horas Motor Dia</Text>
                        <Text className="text-lg font-semibold text-foreground">
                          {item.horasMotorDia.toFixed(1)}h
                        </Text>
                      </>
                    )}
                  </View>
                ) : (
                  <Text className="text-base text-muted">Nenhum lançamento registrado</Text>
                )}

                {/* Alertas de Manutenção */}
                {(item.needsOilChange || item.needs50hRevision) && (
                  <View className="flex-row gap-2 mt-2">
                    {item.needsOilChange && (
                      <View className="bg-error/20 px-4 py-2 rounded-full flex-row items-center gap-1">
                        <Text className="text-sm font-semibold text-error">⚠️ Troca Óleo</Text>
                      </View>
                    )}
                    {item.needs50hRevision && (
                      <View className="bg-warning/20 px-4 py-2 rounded-full flex-row items-center gap-1">
                        <Text className="text-sm font-semibold text-warning">⚠️ Revisão 50h</Text>
                      </View>
                    )}
                  </View>
                )}

                {item.currentHm !== null && item.currentHm !== undefined && (
                  <View className="mt-2">
                    <Text className="text-xs text-muted">Horímetro Atual: {item.currentHm.toFixed(1)}h</Text>
                  </View>
                )}
              </View>
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
