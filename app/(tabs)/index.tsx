import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SyncIndicator } from "@/components/sync-indicator";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

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
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

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

  const machineStatuses: MachineStatus[] = useMemo(() => {
    return (machines || []).map((machine) => {
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
  }, [machines, dailyLogs, maintenanceStatusMap]);

  const completeCount = useMemo(
    () => machineStatuses.filter((m) => m.status === "completo").length,
    [machineStatuses]
  );

  const handleNavigateToLancamento = () => {
    router.push("/(tabs)/lancamento" as any);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22C55E" />
        <Text className="text-sm text-muted mt-3">Carregando…</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background" style={isDesktop ? { marginLeft: 240 } : {}}>
      <FlatList
        data={machineStatuses}
        keyExtractor={(item) => item.maquinaId}
        numColumns={isDesktop ? 3 : 1}
        key={isDesktop ? "desktop-3col" : "mobile-1col"}
        columnWrapperStyle={isDesktop ? { gap: 14 } : undefined}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }}
        ListHeaderComponent={
          <View className="gap-4">
            {/* Header */}
            <View className="bg-surface rounded-3xl p-5 border border-border shadow-soft">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-2xl font-extrabold text-foreground">
                    Controle de Colheita
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    {new Date().toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View className="scale-90">
                  <SyncIndicator />
                </View>
              </View>
            </View>

            {/* KPIs */}
            {dailyReport ? (
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-primary/10 rounded-3xl p-5 border border-primary/25 shadow-soft">
                    <Text className="text-3xl font-extrabold text-primary">
                      {dailyReport.maquinasOperando}
                    </Text>
                    <Text className="text-sm text-muted mt-1">Máquinas ativas</Text>
                  </View>

                  <View className="flex-1 bg-success/10 rounded-3xl p-5 border border-success/25 shadow-soft">
                    <Text className="text-3xl font-extrabold text-success">
                      {dailyReport.totalHorasProd.toFixed(1)}h
                    </Text>
                    <Text className="text-sm text-muted mt-1">Horas produtivas</Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-warning/10 rounded-3xl p-5 border border-warning/25 shadow-soft">
                    <Text className="text-3xl font-extrabold text-warning">
                      {dailyReport.totalArea.toFixed(1)} ha
                    </Text>
                    <Text className="text-sm text-muted mt-1">Área colhida</Text>
                  </View>

                  <View
                    className={`flex-1 rounded-3xl p-5 border shadow-soft ${
                      dailyReport.eficienciaMedia >= 70
                        ? "bg-success/10 border-success/25"
                        : "bg-error/10 border-error/25"
                    }`}
                  >
                    <Text
                      className={`text-3xl font-extrabold ${
                        dailyReport.eficienciaMedia >= 70 ? "text-success" : "text-error"
                      }`}
                    >
                      {dailyReport.eficienciaMedia.toFixed(0)}%
                    </Text>
                    <Text className="text-sm text-muted mt-1">Eficiência média</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="bg-surface rounded-3xl p-5 border border-border shadow-soft">
                <Text className="text-base font-bold text-foreground">
                  Carregando resumo do dia…
                </Text>
                <Text className="text-sm text-muted mt-1">Aguarde alguns segundos.</Text>
              </View>
            )}

            {/* CTA principal */}
            <Pressable
              onPress={handleNavigateToLancamento}
              style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              className="bg-primary rounded-3xl p-5 items-center justify-center shadow-card"
            >
              <Text className="text-base font-extrabold text-white">+ Novo lançamento</Text>
              <Text className="text-xs text-white/80 mt-1">Registrar horas, área e ocorrências</Text>
            </Pressable>

            {/* Título seção */}
            <View className="flex-row items-center justify-between pt-1">
              <Text className="text-lg font-extrabold text-foreground">Máquinas</Text>
              <Text className="text-sm text-muted">
                {completeCount}/{machineStatuses.length} completas
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(tabs)/lancamento?maquina=${item.maquinaId}` as any)}
            style={({ pressed }) => [
              { opacity: pressed ? 0.9 : 1 },
              isDesktop ? { flex: 1 / 3, maxWidth: "32%" } : { flex: 1 },
            ]}
            className="bg-surface rounded-3xl p-5 border border-border shadow-soft"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-2xl font-extrabold text-foreground">{item.maquinaId}</Text>
                <Text className="text-sm text-muted mt-1">{item.nome || "Sem nome"}</Text>
              </View>

              <View
                className={`px-3 py-2 rounded-full ${
                  item.status === "completo" ? "bg-success/15" : "bg-warning/15"
                }`}
              >
                <Text
                  className={`text-xs font-extrabold ${
                    item.status === "completo" ? "text-success" : "text-warning"
                  }`}
                >
                  {item.status === "completo" ? "COMPLETO" : "PENDENTE"}
                </Text>
              </View>
            </View>

            {item.operador ? (
              <View className="gap-2">
                <View>
                  <Text className="text-xs text-muted">Operador</Text>
                  <Text className="text-base font-bold text-foreground">{item.operador}</Text>
                </View>

                {item.horasMotorDia !== null && (
                  <View>
                    <Text className="text-xs text-muted">Horas motor (dia)</Text>
                    <Text className="text-base font-bold text-foreground">
                      {item.horasMotorDia.toFixed(1)}h
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-sm text-muted">Nenhum lançamento hoje</Text>
            )}

            {(item.needsOilChange || item.needs50hRevision) && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {item.needsOilChange && (
                  <View className="bg-error/15 px-3 py-2 rounded-full">
                    <Text className="text-xs font-bold text-error">⚠️ Troca óleo</Text>
                  </View>
                )}
                {item.needs50hRevision && (
                  <View className="bg-warning/15 px-3 py-2 rounded-full">
                    <Text className="text-xs font-bold text-warning">⚠️ Revisão 50h</Text>
                  </View>
                )}
              </View>
            )}

            {item.currentHm !== null && item.currentHm !== undefined && (
              <Text className="text-xs text-muted mt-3">
                Horímetro atual: {item.currentHm.toFixed(1)}h
              </Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="mt-10 px-2">
            <View className="bg-surface rounded-3xl p-7 border border-border shadow-card items-center">
              <Text className="text-5xl mb-3">🚜</Text>
              <Text className="text-xl font-extrabold text-foreground text-center">
                Sem máquinas cadastradas
              </Text>
              <Text className="text-sm text-muted mt-2 text-center leading-5">
                Cadastre suas máquinas (M1, M2, M3, M4) para liberar lançamentos,
                relatórios e manutenção.
              </Text>

              <Pressable
                onPress={() => router.push("/(tabs)/configuracoes" as any)}
                className="bg-primary mt-6 px-6 py-3 rounded-2xl shadow-soft"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text className="text-white font-extrabold text-sm">Cadastrar máquinas</Text>
              </Pressable>
            </View>
          </View>
        }
      />
    </ScreenContainer>
  );
}
