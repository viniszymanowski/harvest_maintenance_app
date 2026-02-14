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

function formatDateLong() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const [todayDate, setTodayDate] = useState("");
  useEffect(() => {
    const today = new Date();
    setTodayDate(today.toISOString().split("T")[0]);
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

  // Status manutenção (queries fixas)
  const m1Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M1" });
  const m2Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M2" });
  const m3Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M3" });
  const m4Status = trpc.maintenance.getMaintenanceStatus.useQuery({ maquinaId: "M4" });

  const maintenanceStatusMap: Record<string, any> = useMemo(
    () => ({
      M1: m1Status.data,
      M2: m2Status.data,
      M3: m3Status.data,
      M4: m4Status.data,
    }),
    [m1Status.data, m2Status.data, m3Status.data, m4Status.data]
  );

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
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  const hasMachines = machineStatuses.length > 0;

  return (
    <ScreenContainer className="px-5 pt-5" style={isDesktop ? { marginLeft: 240 } : {}}>
      <FlatList
        data={machineStatuses}
        keyExtractor={(item) => item.maquinaId}
        numColumns={isDesktop ? 3 : 1}
        key={isDesktop ? "desktop-3col" : "mobile-1col"}
        columnWrapperStyle={isDesktop ? { gap: 16 } : undefined}
        contentContainerStyle={{ paddingBottom: 28, gap: 14 }}
        ListHeaderComponent={
          <View className="gap-4">
            {/* Top Header */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-3xl font-bold text-foreground">Controle de Colheita</Text>
                <Text className="text-sm text-muted mt-1">{formatDateLong()}</Text>
              </View>

              <View className="rounded-2xl bg-surface border border-border px-3 py-2">
                <SyncIndicator />
              </View>
            </View>

            {/* KPIs */}
            {dailyReport ? (
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1 rounded-2xl bg-primary/10 border border-primary/25 p-5">
                    <Text className="text-2xl font-bold text-primary">
                      {dailyReport.maquinasOperando}
                    </Text>
                    <Text className="text-xs text-muted mt-1">Máquinas ativas</Text>
                  </View>

                  <View className="flex-1 rounded-2xl bg-success/10 border border-success/25 p-5">
                    <Text className="text-2xl font-bold text-success">
                      {dailyReport.totalHorasProd.toFixed(1)}h
                    </Text>
                    <Text className="text-xs text-muted mt-1">Horas produtivas</Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 rounded-2xl bg-warning/10 border border-warning/25 p-5">
                    <Text className="text-2xl font-bold text-warning">
                      {dailyReport.totalArea.toFixed(1)} ha
                    </Text>
                    <Text className="text-xs text-muted mt-1">Área colhida hoje</Text>
                  </View>

                  <View
                    className={`flex-1 rounded-2xl p-5 border ${
                      dailyReport.eficienciaMedia >= 70
                        ? "bg-success/10 border-success/25"
                        : "bg-error/10 border-error/25"
                    }`}
                  >
                    <Text
                      className={`text-2xl font-bold ${
                        dailyReport.eficienciaMedia >= 70 ? "text-success" : "text-error"
                      }`}
                    >
                      {dailyReport.eficienciaMedia.toFixed(0)}%
                    </Text>
                    <Text className="text-xs text-muted mt-1">Eficiência média</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="rounded-2xl bg-surface border border-border p-5">
                <Text className="text-base font-semibold text-foreground">
                  Carregando resumo do dia…
                </Text>
                <Text className="text-sm text-muted mt-1">Aguarde alguns segundos.</Text>
              </View>
            )}

            {/* CTA */}
            <Pressable
              onPress={handleNavigateToLancamento}
              style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
              className="rounded-2xl bg-primary p-5 items-center justify-center min-h-touch shadow-sm"
            >
              <Text className="text-base font-bold text-white">+ Novo lançamento</Text>
              <Text className="text-xs text-white/80 mt-1">
                Registrar horas, área e ocorrências
              </Text>
            </Pressable>

            {/* Section title */}
            <View className="flex-row items-end justify-between pt-1">
              <View className="gap-1">
                <Text className="text-lg font-bold text-foreground">Máquinas</Text>
                <Text className="text-xs text-muted">
                  Toque em uma máquina para lançar o dia
                </Text>
              </View>

              <View className="rounded-full bg-surface border border-border px-3 py-2">
                <Text className="text-xs text-muted">
                  {completeCount}/{machineStatuses.length} completas
                </Text>
              </View>
            </View>

            {/* Empty hint (top) */}
            {!hasMachines && (
              <View className="rounded-2xl bg-surface border border-border p-5">
                <Text className="text-base font-semibold text-foreground">
                  Sem máquinas cadastradas
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Cadastre M1, M2, M3, M4 para liberar lançamentos, relatórios e manutenção.
                </Text>

                <Pressable
                  onPress={() => router.push("/(tabs)/configuracoes" as any)}
                  className="mt-4 self-start rounded-xl bg-primary/10 border border-primary/25 px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-primary">Cadastrar máquinas</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(tabs)/lancamento?maquina=${item.maquinaId}` as any)}
            style={({ pressed }) => [
              { opacity: pressed ? 0.88 : 1 },
              isDesktop ? { flex: 1 / 3, maxWidth: "32%" } : { flex: 1 },
            ]}
            className="rounded-2xl bg-surface border border-border p-5 shadow-sm"
          >
            {/* Card header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">{item.maquinaId}</Text>
                <Text className="text-sm text-muted mt-1">{item.nome || "Sem nome"}</Text>
              </View>

              <View
                className={`px-3 py-2 rounded-full border ${
                  item.status === "completo"
                    ? "bg-success/10 border-success/25"
                    : "bg-warning/10 border-warning/25"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    item.status === "completo" ? "text-success" : "text-warning"
                  }`}
                >
                  {item.status === "completo" ? "COMPLETO" : "PENDENTE"}
                </Text>
              </View>
            </View>

            {/* Body */}
            <View className="gap-2">
              {item.operador ? (
                <View className="gap-1">
                  <Text className="text-xs text-muted">Operador</Text>
                  <Text className="text-base font-semibold text-foreground">{item.operador}</Text>

                  {item.horasMotorDia !== null && (
                    <View className="mt-2 rounded-xl bg-background border border-border px-4 py-3">
                      <Text className="text-xs text-muted">Horas motor (dia)</Text>
                      <Text className="text-base font-semibold text-foreground mt-1">
                        {item.horasMotorDia.toFixed(1)}h
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="rounded-xl bg-background border border-border px-4 py-3">
                  <Text className="text-sm text-muted">Nenhum lançamento hoje</Text>
                </View>
              )}

              {/* Alerts */}
              {(item.needsOilChange || item.needs50hRevision) && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {item.needsOilChange && (
                    <View className="bg-error/10 border border-error/25 px-3 py-2 rounded-full">
                      <Text className="text-xs font-semibold text-error">⚠️ Troca óleo</Text>
                    </View>
                  )}
                  {item.needs50hRevision && (
                    <View className="bg-warning/10 border border-warning/25 px-3 py-2 rounded-full">
                      <Text className="text-xs font-semibold text-warning">⚠️ Revisão 50h</Text>
                    </View>
                  )}
                </View>
              )}

              {item.currentHm !== null && item.currentHm !== undefined && (
                <Text className="text-xs text-muted mt-2">
                  Horímetro atual: {item.currentHm.toFixed(1)}h
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
