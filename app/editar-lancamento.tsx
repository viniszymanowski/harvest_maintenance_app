import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function EditarLancamentoScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;

  const { data: log, isLoading } = trpc.dailyLogs.getById.useQuery({ id });
  const updateMutation = trpc.dailyLogs.update.useMutation();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    data: "",
    fazenda: "",
    talhao: "",
    maquinaId: "",
    operador: "",
    saidaProgramada: "",
    saidaReal: "",

    hmMotorInicial: "",
    hmMotorFinal: "",
    hmTrilhaInicial: "",
    hmTrilhaFinal: "",
    prodH: "",
    manH: "",
    chuvaH: "",
    deslocH: "",
    esperaH: "",
    abasteceu: false,
    areaHa: "",
  });

  useEffect(() => {
    if (log) {
      setFormData({
        data: log.data ? new Date(log.data).toISOString().split("T")[0] : "",
        fazenda: log.fazenda || "",
        talhao: log.talhao || "",
        maquinaId: log.maquinaId || "",
        operador: log.operador || "",
        saidaProgramada: log.saidaProgramada || "",
        saidaReal: log.saidaReal || "",

        hmMotorInicial: log.hmMotorInicial?.toString() || "",
        hmMotorFinal: log.hmMotorFinal?.toString() || "",
        hmTrilhaInicial: log.hmTrilhaInicial?.toString() || "",
        hmTrilhaFinal: log.hmTrilhaFinal?.toString() || "",
        prodH: log.prodH?.toString() || "",
        manH: log.manH?.toString() || "",
        chuvaH: log.chuvaH?.toString() || "",
        deslocH: log.deslocH?.toString() || "",
        esperaH: log.esperaH?.toString() || "",
        abasteceu: log.abasteceu || false,
        areaHa: log.areaHa?.toString() || "",
      });
    }
  }, [log]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          data: formData.data,
          fazenda: formData.fazenda,
          talhao: formData.talhao,
          maquinaId: formData.maquinaId as any,
          operador: formData.operador,
          saidaProgramada: formData.saidaProgramada,
          saidaReal: formData.saidaReal,
          hmMotorInicial: parseFloat(formData.hmMotorInicial) || 0,
          hmMotorFinal: parseFloat(formData.hmMotorFinal) || 0,
          hmTrilhaInicial: parseFloat(formData.hmTrilhaInicial) || 0,
          hmTrilhaFinal: parseFloat(formData.hmTrilhaFinal) || 0,
          prodH: parseFloat(formData.prodH) || 0,
          manH: parseFloat(formData.manH) || 0,
          chuvaH: parseFloat(formData.chuvaH) || 0,
          deslocH: parseFloat(formData.deslocH) || 0,
          esperaH: parseFloat(formData.esperaH) || 0,
          abasteceu: formData.abasteceu,
          areaHa: parseFloat(formData.areaHa) || 0,
        },
      });

      utils.dailyLogs.invalidate();
      Alert.alert("Sucesso", "Lançamento atualizado com sucesso!");
      router.back();
    } catch (error) {
      console.error("Erro ao atualizar lançamento:", error);
      Alert.alert("Erro", "Não foi possível atualizar o lançamento");
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Editar Lançamento</Text>
          <Text className="text-sm text-muted mt-1">Atualize os dados do lançamento</Text>
        </View>

        <View className="gap-4">
          {/* Data */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Data</Text>
            <TextInput
              value={formData.data}
              onChangeText={(text) => setFormData({ ...formData, data: text })}
              placeholder="YYYY-MM-DD"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
          </View>

          {/* Fazenda e Talhão */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Fazenda</Text>
              <TextInput
                value={formData.fazenda}
                onChangeText={(text) => setFormData({ ...formData, fazenda: text })}
                placeholder="Nome da fazenda"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Talhão</Text>
              <TextInput
                value={formData.talhao}
                onChangeText={(text) => setFormData({ ...formData, talhao: text })}
                placeholder="Ex: T1"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
          </View>

          {/* Máquina e Operador */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Máquina</Text>
              <TextInput
                value={formData.maquinaId}
                onChangeText={(text) => setFormData({ ...formData, maquinaId: text })}
                placeholder="Ex: M1"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Operador</Text>
              <TextInput
                value={formData.operador}
                onChangeText={(text) => setFormData({ ...formData, operador: text })}
                placeholder="Nome do operador"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
          </View>

          {/* Horímetros */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">HM Motor Inicial</Text>
              <TextInput
                value={formData.hmMotorInicial}
                onChangeText={(text) => setFormData({ ...formData, hmMotorInicial: text })}
                placeholder="0.0"
                keyboardType="numeric"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">HM Motor Final</Text>
              <TextInput
                value={formData.hmMotorFinal}
                onChangeText={(text) => setFormData({ ...formData, hmMotorFinal: text })}
                placeholder="0.0"
                keyboardType="numeric"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
          </View>

          {/* Horas do Dia */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Prod (h)</Text>
              <TextInput
                value={formData.prodH}
                onChangeText={(text) => setFormData({ ...formData, prodH: text })}
                placeholder="0.0"
                keyboardType="numeric"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Man (h)</Text>
              <TextInput
                value={formData.manH}
                onChangeText={(text) => setFormData({ ...formData, manH: text })}
                placeholder="0.0"
                keyboardType="numeric"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
          </View>

          {/* Área */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Área (ha)</Text>
            <TextInput
              value={formData.areaHa}
              onChangeText={(text) => setFormData({ ...formData, areaHa: text })}
              placeholder="0.00"
              keyboardType="numeric"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
          </View>

          {/* Botões */}
          <View className="flex-row gap-3 mt-4 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-surface border border-border py-4 rounded-full items-center"
            >
              <Text className="text-foreground font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-primary py-4 rounded-full items-center"
            >
              <Text className="text-white font-bold">Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
