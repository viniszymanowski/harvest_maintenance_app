import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

interface Part {
  tempId: string;
  nomePeca: string;
  qtde: string;
  valorUnit: string;
}

export default function ManutencaoScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [filterMachine, setFilterMachine] = useState<string | null>(null);

  // Form state
  const [maquinaId, setMaquinaId] = useState("M1");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [tipo, setTipo] = useState<"preventiva" | "corretiva_leve" | "corretiva_pesada">(
    "preventiva"
  );
  const [hmMotorNoServico, setHmMotorNoServico] = useState("");
  const [tempoParadoH, setTempoParadoH] = useState("");
  const [trocaOleo, setTrocaOleo] = useState(false);
  const [revisao50h, setRevisao50h] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [parts, setParts] = useState<Part[]>([]);

  const utils = trpc.useUtils();
  const { data: machines } = trpc.machines.list.useQuery();
  const { data: maintenances, isLoading } = trpc.maintenance.list.useQuery();

  // Pré-preencher horímetro ao selecionar máquina
  useEffect(() => {
    if (maquinaId && machines) {
      const maquinaSelecionada = machines.find((m) => m.id === maquinaId);
      if (maquinaSelecionada) {
        setHmMotorNoServico(maquinaSelecionada.hmMotorAtual?.toString() || "0");
      }
    }
  }, [maquinaId, machines]);

  const createMutation = trpc.maintenance.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.maintenance.list.invalidate();
      resetForm();
      setModalVisible(false);
      Alert.alert("Sucesso", "Manutenção registrada com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const resetForm = () => {
    setMaquinaId("M1");
    setData(new Date().toISOString().split("T")[0]);
    setTipo("preventiva");
    setHmMotorNoServico("");
    setTempoParadoH("");
    setTrocaOleo(false);
    setRevisao50h(false);
    setObservacao("");
    setParts([]);
  };

  const addPart = () => {
    setParts([
      ...parts,
      { tempId: Date.now().toString(), nomePeca: "", qtde: "1", valorUnit: "0" },
    ]);
  };

  const removePart = (tempId: string) => {
    setParts(parts.filter((p) => p.tempId !== tempId));
  };

  const updatePart = (tempId: string, field: keyof Part, value: string) => {
    setParts(parts.map((p) => (p.tempId === tempId ? { ...p, [field]: value } : p)));
  };

  const calculateTotal = () => {
    return parts.reduce((sum, p) => {
      const qtde = parseFloat(p.qtde) || 0;
      const valor = parseFloat(p.valorUnit) || 0;
      return sum + qtde * valor;
    }, 0);
  };

  const handleSubmit = () => {
    if (!hmMotorNoServico || !tempoParadoH) {
      Alert.alert("Erro", "Preencha horímetro e tempo parado");
      return;
    }

    const maintenanceData = {
      data,
      maquinaId,
      tipo,
      hmMotorNoServico: parseFloat(hmMotorNoServico),
      tempoParadoH: parseFloat(tempoParadoH),
      trocaOleo,
      revisao50h,
      observacao: observacao || undefined,
      parts: parts
        .filter((p) => p.nomePeca.trim())
        .map((p) => ({
          nomePeca: p.nomePeca,
          qtde: parseInt(p.qtde) || 1,
          valorUnit: parseFloat(p.valorUnit) || 0,
        })),
    };

    createMutation.mutate(maintenanceData as any);
  };

  const filteredMaintenances = maintenances?.filter((m) =>
    filterMachine ? m.maquinaId === filterMachine : true
  );

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
          <Text className="text-3xl font-bold text-foreground">Manutenção</Text>
          <Text className="text-base text-muted">Gerencie manutenções e peças das máquinas</Text>
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setFilterMachine(null)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className={`px-4 py-2 rounded-full ${
                filterMachine === null ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-semibold ${
                  filterMachine === null ? "text-white" : "text-foreground"
                }`}
              >
                Todas
              </Text>
            </Pressable>
            {machines?.map((m: any) => (
              <Pressable
                key={m.id}
                onPress={() => setFilterMachine(m.id)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className={`px-4 py-2 rounded-full ${
                  filterMachine === m.id ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    filterMachine === m.id ? "text-white" : "text-foreground"
                  }`}
                >
                  {m.id}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Add Button */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          className="bg-primary rounded-2xl p-4 flex-row items-center justify-center gap-2"
        >
          <IconSymbol name="plus" size={24} color="#fff" />
          <Text className="text-lg font-bold text-white">Nova Manutenção</Text>
        </Pressable>

        {/* Maintenances List */}
        <FlatList
          data={filteredMaintenances}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-muted text-base">Nenhuma manutenção registrada</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-surface rounded-2xl p-5 mb-4 border border-border">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground">{item.maquinaId}</Text>
                  <Text className="text-sm text-muted">
                    {new Date(item.data).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.tipo === "preventiva"
                      ? "bg-success"
                      : item.tipo === "corretiva_leve"
                        ? "bg-warning"
                        : "bg-error"
                  }`}
                >
                  <Text className="text-xs font-semibold text-white">
                    {item.tipo === "preventiva"
                      ? "Preventiva"
                      : item.tipo === "corretiva_leve"
                        ? "Corretiva Leve"
                        : "Corretiva Pesada"}
                  </Text>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Horímetro Motor</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {item.hmMotorNoServico}h
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Tempo Parado</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {item.tempoParadoH}h
                  </Text>
                </View>
                {(item.trocaOleo || item.revisao50h) && (
                  <View className="flex-row gap-2 mt-2">
                    {item.trocaOleo && (
                      <View className="bg-primary/20 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-primary">Troca Óleo</Text>
                      </View>
                    )}
                    {item.revisao50h && (
                      <View className="bg-primary/20 px-3 py-1 rounded-full">
                        <Text className="text-xs font-semibold text-primary">Revisão 50h</Text>
                      </View>
                    )}
                  </View>
                )}
                {item.observacao && (
                  <View className="mt-2 p-3 bg-background rounded-xl">
                    <Text className="text-sm text-muted">{item.observacao}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      </View>

      {/* New Maintenance Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-background rounded-t-3xl">
            <ScrollView className="flex-1 p-6">
              <View className="gap-6">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-foreground">Nova Manutenção</Text>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <IconSymbol name="xmark.circle.fill" size={28} color="#9BA1A6" />
                  </Pressable>
                </View>

                {/* Machine Selector */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">Máquina *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {machines?.map((m: any) => (
                        <Pressable
                          key={m.id}
                          onPress={() => setMaquinaId(m.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          className={`px-4 py-3 rounded-xl ${
                            maquinaId === m.id ? "bg-primary" : "bg-surface border border-border"
                          }`}
                        >
                          <Text
                            className={`font-semibold ${
                              maquinaId === m.id ? "text-white" : "text-foreground"
                            }`}
                          >
                            {m.id}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Date */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">Data *</Text>
                  <TextInput
                    value={data}
                    onChangeText={setData}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                {/* Type */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">Tipo *</Text>
                  <View className="flex-row gap-2">
                    {[
                      { value: "preventiva", label: "Preventiva" },
                      { value: "corretiva_leve", label: "Corretiva Leve" },
                      { value: "corretiva_pesada", label: "Corretiva Pesada" },
                    ].map((t) => (
                      <Pressable
                        key={t.value}
                        onPress={() => setTipo(t.value as any)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                        className={`flex-1 px-3 py-3 rounded-xl ${
                          tipo === t.value ? "bg-primary" : "bg-surface border border-border"
                        }`}
                      >
                        <Text
                          className={`font-semibold text-center text-xs ${
                            tipo === t.value ? "text-white" : "text-foreground"
                          }`}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Horimeter */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">Horímetro Motor *</Text>
                  <TextInput
                    value={hmMotorNoServico}
                    onChangeText={setHmMotorNoServico}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Downtime */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">Tempo Parado (h) *</Text>
                  <TextInput
                    value={tempoParadoH}
                    onChangeText={setTempoParadoH}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Checkboxes */}
                <View className="gap-3">
                  <View className="flex-row items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
                    <Text className="text-base text-foreground">Troca de Óleo</Text>
                    <Switch value={trocaOleo} onValueChange={setTrocaOleo} />
                  </View>
                  <View className="flex-row items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
                    <Text className="text-base text-foreground">Revisão 50h</Text>
                    <Switch value={revisao50h} onValueChange={setRevisao50h} />
                  </View>
                </View>

                {/* Parts */}
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-muted">Peças Utilizadas</Text>
                    <Pressable
                      onPress={addPart}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="bg-primary px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white font-semibold text-xs">+ Adicionar</Text>
                    </Pressable>
                  </View>

                  {parts.map((part) => (
                    <View
                      key={part.tempId}
                      className="bg-surface border border-border rounded-xl p-3 gap-2"
                    >
                      <View className="flex-row items-center justify-between">
                        <TextInput
                          value={part.nomePeca}
                          onChangeText={(v) => updatePart(part.tempId, "nomePeca", v)}
                          className="flex-1 text-foreground"
                          placeholder="Nome da peça"
                        />
                        <Pressable
                          onPress={() => removePart(part.tempId)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                          <IconSymbol name="trash" size={20} color="#EF4444" />
                        </Pressable>
                      </View>
                      <View className="flex-row gap-2">
                        <TextInput
                          value={part.qtde}
                          onChangeText={(v) => updatePart(part.tempId, "qtde", v)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                          placeholder="Qtde"
                          keyboardType="numeric"
                        />
                        <TextInput
                          value={part.valorUnit}
                          onChangeText={(v) => updatePart(part.tempId, "valorUnit", v)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                          placeholder="Valor Unit."
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                  ))}

                  {parts.length > 0 && (
                    <View className="bg-primary/10 rounded-xl p-3 flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-foreground">Total</Text>
                      <Text className="text-lg font-bold text-primary">
                        R$ {calculateTotal().toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Observations */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">Observações</Text>
                  <TextInput
                    value={observacao}
                    onChangeText={setObservacao}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="Observações adicionais"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={createMutation.isPending}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                  className="bg-primary rounded-2xl p-4 items-center mb-8"
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-bold text-white">Salvar Manutenção</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
