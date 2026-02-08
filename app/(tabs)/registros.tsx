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
import { DatePicker } from "@/components/date-picker";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Modal, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";

export default function RegistrosScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [editingLog, setEditingLog] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const updateMutation = trpc.dailyLogs.update.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.dailyLogs.getByDate.invalidate();
      setShowEditModal(false);
      Alert.alert("Sucesso", "Registro atualizado com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

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

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setShowEditModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveEdit = () => {
    if (!editingLog) return;
    updateMutation.mutate({
      id: editingLog.id,
      data: editingLog,
    });
  };

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

        {/* Date Selector with Quick Actions */}
        <View className="gap-3">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            label="Selecione a Data"
          />
          
          {/* Quick Date Buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => {
                const today = new Date();
                setSelectedDate(today.toISOString().split("T")[0]);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-primary/20 rounded-xl py-3 items-center border-2 border-primary/30"
            >
              <Text className="text-sm font-semibold text-primary">Hoje</Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split("T")[0]);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-surface rounded-xl py-3 items-center border-2 border-border"
            >
              <Text className="text-sm font-semibold text-foreground">Ontem</Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                setSelectedDate(weekAgo.toISOString().split("T")[0]);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1 bg-surface rounded-xl py-3 items-center border-2 border-border"
            >
              <Text className="text-sm font-semibold text-foreground">7 dias atrás</Text>
            </Pressable>
          </View>
          
          {/* Record Counter */}
          <Text className="text-sm text-muted text-center">
            {dailyLogs?.length || 0} registro(s) encontrado(s)
          </Text>
        </View>

        {/* Machine Records */}
        <FlatList
          data={machineRecords}
          keyExtractor={(item) => item.maquinaId}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => item.log && handleEdit(item.log)}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              className="bg-surface rounded-2xl p-5 mb-4 border-2 border-border"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-bold text-foreground">{item.maquinaId}</Text>
                {item.log && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleEdit(item.log!)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="bg-primary/20 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-sm font-semibold text-primary">✏️ Editar</Text>
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item.log!.id);
                      }}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="bg-error/20 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-sm font-semibold text-error">🗑️ Excluir</Text>
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

                  {item.log.chegadaLavoura && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Chegada Lavoura</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {item.log.chegadaLavoura}
                      </Text>
                    </View>
                  )}

                  {item.log.saidaLavoura && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Saída Lavoura</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {item.log.saidaLavoura}
                      </Text>
                    </View>
                  )}

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
            </Pressable>
          )}
        />
      </View>

      {/* Modal de Edição */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-background">
          {/* Header do Modal */}
          <View className="bg-primary p-6 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">Editar Registro</Text>
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                className="bg-white/20 px-4 py-2 rounded-lg"
              >
                <Text className="text-base font-semibold text-white">✕ Fechar</Text>
              </Pressable>
            </View>
            <Text className="text-base text-white/80 mt-2">
              Máquina: {editingLog?.maquinaId}
            </Text>
          </View>

          <ScrollView className="flex-1 p-6">
            {editingLog && (
              <View className="gap-4">
                {/* Operador */}
                <View>
                  <Text className="text-base font-semibold text-foreground mb-2">Operador</Text>
                  <TextInput
                    value={editingLog.operador}
                    onChangeText={(text) => setEditingLog({ ...editingLog, operador: text })}
                    className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                    placeholder="Nome do operador"
                  />
                </View>

                {/* Fazenda e Talhão */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-2">Fazenda</Text>
                    <TextInput
                      value={editingLog.fazenda}
                      onChangeText={(text) => setEditingLog({ ...editingLog, fazenda: text })}
                      className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                      placeholder="Fazenda"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-2">Talhão</Text>
                    <TextInput
                      value={editingLog.talhao}
                      onChangeText={(text) => setEditingLog({ ...editingLog, talhao: text })}
                      className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                      placeholder="Talhão"
                    />
                  </View>
                </View>

                {/* Horímetros Motor */}
                <View className="bg-primary/10 p-4 rounded-xl border-2 border-primary/20">
                  <Text className="text-lg font-bold text-primary mb-3">Horímetros Motor</Text>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground mb-2">Inicial</Text>
                      <TextInput
                        value={editingLog.hmMotorInicial?.toString() || ""}
                        onChangeText={(text) =>
                          setEditingLog({ ...editingLog, hmMotorInicial: parseFloat(text) || 0 })
                        }
                        className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                        placeholder="0.0"
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground mb-2">Final</Text>
                      <TextInput
                        value={editingLog.hmMotorFinal?.toString() || ""}
                        onChangeText={(text) =>
                          setEditingLog({ ...editingLog, hmMotorFinal: parseFloat(text) || 0 })
                        }
                        className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                        placeholder="0.0"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>

                {/* Horas do Dia */}
                <View className="bg-success/10 p-4 rounded-xl border-2 border-success/20">
                  <Text className="text-lg font-bold text-success mb-3">Horas do Dia</Text>
                  <View className="gap-3">
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-2">Produção (h)</Text>
                        <TextInput
                          value={editingLog.prodH?.toString() || ""}
                          onChangeText={(text) =>
                            setEditingLog({ ...editingLog, prodH: parseFloat(text) || 0 })
                          }
                          className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                          placeholder="0.0"
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-2">Manutenção (h)</Text>
                        <TextInput
                          value={editingLog.manH?.toString() || ""}
                          onChangeText={(text) =>
                            setEditingLog({ ...editingLog, manH: parseFloat(text) || 0 })
                          }
                          className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                          placeholder="0.0"
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-2">Chuva (h)</Text>
                        <TextInput
                          value={editingLog.chuvaH?.toString() || ""}
                          onChangeText={(text) =>
                            setEditingLog({ ...editingLog, chuvaH: parseFloat(text) || 0 })
                          }
                          className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                          placeholder="0.0"
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-2">Área (ha)</Text>
                        <TextInput
                          value={editingLog.areaHa?.toString() || ""}
                          onChangeText={(text) =>
                            setEditingLog({ ...editingLog, areaHa: parseFloat(text) || 0 })
                          }
                          className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                          placeholder="0.0"
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Observações */}
                <View>
                  <Text className="text-base font-semibold text-foreground mb-2">Observações</Text>
                  <TextInput
                    value={editingLog.observacoes || ""}
                    onChangeText={(text) => setEditingLog({ ...editingLog, observacoes: text })}
                    className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                    placeholder="Observações adicionais"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Botões de Ação */}
                <View className="gap-3 mt-4 mb-8">
                  <Pressable
                    onPress={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className="bg-primary rounded-xl py-4 items-center min-h-touch"
                  >
                    {updateMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-lg font-bold text-white">
                        💾 Salvar Alterações
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => setShowEditModal(false)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-surface border-2 border-border rounded-xl py-4 items-center"
                  >
                    <Text className="text-lg font-semibold text-foreground">Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
