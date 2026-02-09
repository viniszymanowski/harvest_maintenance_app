
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";

export default function LancamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const utils = trpc.useUtils();

  // Buscar dados dos cadastros
  const { data: fazendas } = trpc.fazendas.list.useQuery();
  const { data: talhoes } = trpc.talhoes.list.useQuery();
  const { data: machines } = trpc.machines.list.useQuery();
  const { data: operadores } = trpc.operadores.list.useQuery();

  const [data, setData] = useState("");
  const [fazenda, setFazenda] = useState("");
  const [talhao, setTalhao] = useState("");
  const [maquinaId, setMaquinaId] = useState<"M1" | "M2" | "M3" | "M4">(
    (params.maquina as any) || "M1"
  );
  const [operador, setOperador] = useState("");
  const [saidaProgramada, setSaidaProgramada] = useState("");
  const [saidaReal, setSaidaReal] = useState("");
  const [chegadaLavoura, setChegadaLavoura] = useState("");
  const [saidaLavoura, setSaidaLavoura] = useState("");
  const [hmMotorInicial, setHmMotorInicial] = useState("");
  const [hmMotorFinal, setHmMotorFinal] = useState("");
  const [hmTrilhaInicial, setHmTrilhaInicial] = useState("");
  const [hmTrilhaFinal, setHmTrilhaFinal] = useState("");
  const [prodH, setProdH] = useState("");
  const [manH, setManH] = useState("");
  const [chuvaH, setChuvaH] = useState("");
  const [deslocH, setDeslocH] = useState("");
  const [esperaH, setEsperaH] = useState("");
  const [abasteceu, setAbasteceu] = useState(false);
  const [areaHa, setAreaHa] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setData(formatted);
  }, []);

  // Encontrar fazenda selecionada
  const fazendaSelecionada = useMemo(() => {
    return (fazendas || []).find((f) => f.nome === fazenda);
  }, [fazendas, fazenda]);

  // Filtrar talhões da fazenda selecionada
  const talhoesDisponiveis = useMemo(() => {
    if (!fazendaSelecionada) return [];
    return (talhoes || []).filter((t) => t.fazendaId === fazendaSelecionada.id);
  }, [talhoes, fazendaSelecionada]);

  const createMutation = trpc.dailyLogs.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.dailyLogs.getByDate.invalidate();
      Alert.alert("Sucesso", "Lançamento salvo com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  // Cálculos em tempo real
  const horasMotorDia = useMemo(() => {
    const inicial = parseFloat(hmMotorInicial);
    const final = parseFloat(hmMotorFinal);
    if (!isNaN(inicial) && !isNaN(final)) {
      return final - inicial;
    }
    return null;
  }, [hmMotorInicial, hmMotorFinal]);

  const horasTrilhaDia = useMemo(() => {
    const inicial = parseFloat(hmTrilhaInicial);
    const final = parseFloat(hmTrilhaFinal);
    if (!isNaN(inicial) && !isNaN(final)) {
      return final - inicial;
    }
    return null;
  }, [hmTrilhaInicial, hmTrilhaFinal]);

  const atrasoMin = useMemo(() => {
    if (saidaProgramada && saidaReal) {
      const [progH, progM] = saidaProgramada.split(":").map(Number);
      const [realH, realM] = saidaReal.split(":").map(Number);
      if (!isNaN(progH) && !isNaN(progM) && !isNaN(realH) && !isNaN(realM)) {
        const progMinutes = progH * 60 + progM;
        const realMinutes = realH * 60 + realM;
        return realMinutes - progMinutes;
      }
    }
    return null;
  }, [saidaProgramada, saidaReal]);

  const divergente = useMemo(() => {
    if (horasMotorDia !== null) {
      const soma =
        parseFloat(prodH || "0") +
        parseFloat(manH || "0") +
        parseFloat(chuvaH || "0") +
        parseFloat(deslocH || "0") +
        parseFloat(esperaH || "0");
      const diferenca = Math.abs(soma - horasMotorDia);
      return diferenca > 0.5;
    }
    return false;
  }, [horasMotorDia, prodH, manH, chuvaH, deslocH, esperaH]);

  // Cálculo automático de horas de produção
  useEffect(() => {
    if (horasMotorDia !== null && horasMotorDia > 0) {
      // Se nenhum campo de horas foi preenchido ainda, preencher automaticamente
      const somaAtual = parseFloat(prodH || "0") + parseFloat(manH || "0") + 
                        parseFloat(chuvaH || "0") + parseFloat(deslocH || "0") + 
                        parseFloat(esperaH || "0");
      
      if (somaAtual === 0) {
        // Preencher produção automaticamente com o total de horas motor
        setProdH(horasMotorDia.toFixed(1));
      }
    }
  }, [horasMotorDia, prodH, manH, chuvaH, deslocH, esperaH]);

  const handleSave = async (saveAndNew: boolean = false) => {
    if (!fazenda || !talhao || !operador) {
      Alert.alert("Erro", "Preencha os campos obrigatórios: Fazenda, Talhão e Operador");
      return;
    }

    // Buscar máquina selecionada para validar horímetros
    const maquinaSelecionada = (machines || []).find((m) => m.id === maquinaId);
    
    if (maquinaSelecionada) {
      // Validar HM Motor
      if (hmMotorFinal && maquinaSelecionada.hmMotorAtual) {
        const hmFinal = parseFloat(hmMotorFinal);
        if (hmFinal < maquinaSelecionada.hmMotorAtual) {
          Alert.alert(
            "⚠️ Atenção: Horímetro Motor Inválido",
            `HM Motor Final (${hmFinal.toFixed(1)}h) é menor que o HM Motor Atual da máquina (${maquinaSelecionada.hmMotorAtual.toFixed(1)}h).\n\nDeseja continuar mesmo assim?`,
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Continuar", onPress: () => salvarLancamento(saveAndNew) },
            ]
          );
          return;
        }
      }

      // Validar HM Trilha
      if (hmTrilhaFinal && maquinaSelecionada.hmTrilhaAtual) {
        const htFinal = parseFloat(hmTrilhaFinal);
        if (htFinal < maquinaSelecionada.hmTrilhaAtual) {
          Alert.alert(
            "⚠️ Atenção: Horímetro Trilha Inválido",
            `HM Trilha Final (${htFinal.toFixed(1)}h) é menor que o HM Trilha Atual da máquina (${maquinaSelecionada.hmTrilhaAtual.toFixed(1)}h).\n\nDeseja continuar mesmo assim?`,
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Continuar", onPress: () => salvarLancamento(saveAndNew) },
            ]
          );
          return;
        }
      }
    }

    // Se passou nas validações, salvar diretamente
    await salvarLancamento(saveAndNew);
  };

  const updateMachineMutation = trpc.machines.updateName.useMutation();

  const salvarLancamento = async (saveAndNew: boolean) => {
    await createMutation.mutateAsync({
      data,
      fazenda,
      talhao,
      maquinaId,
      operador,
      saidaProgramada: saidaProgramada || undefined,
      saidaReal: saidaReal || undefined,
      chegadaLavoura: chegadaLavoura || undefined,
      saidaLavoura: saidaLavoura || undefined,
      hmMotorInicial: hmMotorInicial ? parseFloat(hmMotorInicial) : undefined,
      hmMotorFinal: hmMotorFinal ? parseFloat(hmMotorFinal) : undefined,
      hmTrilhaInicial: hmTrilhaInicial ? parseFloat(hmTrilhaInicial) : undefined,
      hmTrilhaFinal: hmTrilhaFinal ? parseFloat(hmTrilhaFinal) : undefined,
      prodH: parseFloat(prodH || "0"),
      manH: parseFloat(manH || "0"),
      chuvaH: parseFloat(chuvaH || "0"),
      deslocH: parseFloat(deslocH || "0"),
      esperaH: parseFloat(esperaH || "0"),
      abasteceu,
      areaHa: areaHa ? parseFloat(areaHa) : undefined,
      observacoes: observacoes || undefined,
    });

    // Atualizar horímetros da máquina automaticamente
    if (hmMotorFinal || hmTrilhaFinal) {
      const maquinaSelecionada = (machines || []).find((m) => m.id === maquinaId);
      if (maquinaSelecionada) {
        const updateData: any = {
          id: maquinaId,
          nome: maquinaSelecionada.nome || maquinaId,
        };
        
        if (hmMotorFinal) {
          updateData.hmMotorAtual = parseFloat(hmMotorFinal);
        }
        
        if (hmTrilhaFinal) {
          updateData.hmTrilhaAtual = parseFloat(hmTrilhaFinal);
        }

        // Atualizar máquina com novos horímetros
        await updateMachineMutation.mutateAsync(updateData);
        
        // Invalidar cache para atualizar a UI
        utils.machines.list.invalidate();
      }
    }

    if (saveAndNew) {
      // Limpar formulário
      setFazenda("");
      setTalhao("");
      setOperador("");
      setSaidaProgramada("");
      setSaidaReal("");
      setChegadaLavoura("");
      setSaidaLavoura("");
      setHmMotorInicial("");
      setHmMotorFinal("");
      setHmTrilhaInicial("");
      setHmTrilhaFinal("");
      setProdH("");
      setManH("");
      setChuvaH("");
      setDeslocH("");
      setEsperaH("");
      setAbasteceu(false);
      setAreaHa("");
      setObservacoes("");
    } else {
      router.back();
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Lançamento Rápido</Text>
            <Text className="text-base text-muted">Registre as informações da colheita</Text>
          </View>

          {/* Informações Básicas */}
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Informações Básicas</Text>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Data</Text>
              <TextInput
                value={data}
                onChangeText={setData}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Fazenda *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={fazenda}
                  onValueChange={(value) => {
                    setFazenda(value);
                    setTalhao(""); // Resetar talhão ao mudar fazenda
                  }}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Selecione uma fazenda" value="" />
                  {(fazendas || []).map((f) => (
                    <Picker.Item key={f.id} label={f.nome || "Sem nome"} value={f.nome || ""} />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Talhão *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={talhao}
                  onValueChange={setTalhao}
                  style={{ height: 50 }}
                  enabled={!!fazenda}
                >
                  <Picker.Item label={fazenda ? "Selecione um talhão" : "Selecione fazenda primeiro"} value="" />
                  {talhoesDisponiveis.map((t) => (
                    <Picker.Item 
                      key={t.id} 
                      label={`${t.nome || "Sem nome"} - ${t.areaHa || 0}ha`} 
                      value={t.nome || ""} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Máquina</Text>
              <View className="flex-row gap-2">
                {(["M1", "M2", "M3", "M4"] as const).map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMaquinaId(m)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      maquinaId === m ? "bg-primary" : "bg-background border border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        maquinaId === m ? "text-white" : "text-foreground"
                      }`}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Operador *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={operador}
                  onValueChange={setOperador}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Selecione um operador" value="" />
                  {(operadores || []).map((op) => (
                    <Picker.Item key={op.id} label={op.nome || "Sem nome"} value={op.nome || ""} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Horários */}
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Horários</Text>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Saída Programada (HH:MM)</Text>
              <TextInput
                value={saidaProgramada}
                onChangeText={setSaidaProgramada}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Saída Real (HH:MM)</Text>
              <TextInput
                value={saidaReal}
                onChangeText={setSaidaReal}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="08:15"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Chegada Lavoura (HH:MM)</Text>
              <TextInput
                value={chegadaLavoura}
                onChangeText={setChegadaLavoura}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="09:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Saída Lavoura (HH:MM)</Text>
              <TextInput
                value={saidaLavoura}
                onChangeText={setSaidaLavoura}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="18:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {atrasoMin !== null && (
              <View
                className={`p-3 rounded-xl ${
                  atrasoMin <= 5 ? "bg-success/20" : "bg-warning/20"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    atrasoMin <= 5 ? "text-success" : "text-warning"
                  }`}
                >
                  Atraso: {atrasoMin} minutos
                </Text>
              </View>
            )}
          </View>

          {/* Horímetros */}
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Horímetros</Text>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">HM Motor Inicial</Text>
                <TextInput
                  value={hmMotorInicial}
                  onChangeText={setHmMotorInicial}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">HM Motor Final</Text>
                <TextInput
                  value={hmMotorFinal}
                  onChangeText={setHmMotorFinal}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {horasMotorDia !== null && (
              <View className="p-3 rounded-xl bg-primary/20">
                <Text className="text-sm font-semibold text-primary">
                  Horas Motor Dia: {horasMotorDia.toFixed(1)}h
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">HM Trilha Inicial</Text>
                <TextInput
                  value={hmTrilhaInicial}
                  onChangeText={setHmTrilhaInicial}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">HM Trilha Final</Text>
                <TextInput
                  value={hmTrilhaFinal}
                  onChangeText={setHmTrilhaFinal}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {horasTrilhaDia !== null && (
              <View className="p-3 rounded-xl bg-primary/20">
                <Text className="text-sm font-semibold text-primary">
                  Horas Trilha Dia: {horasTrilhaDia.toFixed(1)}h
                </Text>
              </View>
            )}
          </View>

          {/* Horas do Dia */}
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Horas do Dia</Text>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">Produção (h)</Text>
                <TextInput
                  value={prodH}
                  onChangeText={setProdH}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">Manutenção (h)</Text>
                <TextInput
                  value={manH}
                  onChangeText={setManH}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">Chuva (h)</Text>
                <TextInput
                  value={chuvaH}
                  onChangeText={setChuvaH}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm font-medium text-muted">Deslocamento (h)</Text>
                <TextInput
                  value={deslocH}
                  onChangeText={setDeslocH}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Espera (h)</Text>
              <TextInput
                value={esperaH}
                onChangeText={setEsperaH}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>

            {divergente && (
              <View className="p-3 rounded-xl bg-warning/20">
                <Text className="text-sm font-semibold text-warning">
                  ⚠️ Divergência detectada: A soma das horas do dia difere das horas do motor em
                  mais de 0.5h
                </Text>
              </View>
            )}
          </View>

          {/* Outros */}
          <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Outros</Text>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Abasteceu?</Text>
              <Pressable
                onPress={() => setAbasteceu(!abasteceu)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className={`py-3 rounded-xl items-center ${
                  abasteceu ? "bg-primary" : "bg-background border border-border"
                }`}
              >
                <Text className={`font-semibold ${abasteceu ? "text-white" : "text-foreground"}`}>
                  {abasteceu ? "Sim" : "Não"}
                </Text>
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Área (ha)</Text>
              <TextInput
                value={areaHa}
                onChangeText={setAreaHa}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Observações</Text>
              <TextInput
                value={observacoes}
                onChangeText={setObservacoes}
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Observações adicionais"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Botões */}
          <View className="gap-3">
            <Pressable
              onPress={() => handleSave(false)}
              disabled={createMutation.isPending}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              className="bg-primary rounded-2xl p-5 items-center"
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Salvar</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => handleSave(true)}
              disabled={createMutation.isPending}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="bg-background border-2 border-primary rounded-2xl p-5 items-center"
            >
              <Text className="text-lg font-bold text-primary">Salvar e Novo</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
