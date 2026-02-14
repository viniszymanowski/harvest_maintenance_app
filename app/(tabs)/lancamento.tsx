
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
import { SyncIndicator } from "@/components/sync-indicator";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { useSync } from "@/hooks/use-sync";
import { addToSyncQueue, saveDailyLogLocal } from "@/lib/sqlite";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function LancamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const utils = trpc.useUtils();
  const { isOnline, updatePendingCount } = useSync();

  // Buscar dados dos cadastros
  const { data: fazendas } = trpc.fazendas.list.useQuery();
  const { data: talhoes } = trpc.talhoes.list.useQuery();
  const { data: machines } = trpc.machines.list.useQuery();
  const { data: operadores } = trpc.operadores.list.useQuery();
  const { data: lastLog } = trpc.dailyLogs.getLast.useQuery();

  const [data, setData] = useState("");
  const [fazenda, setFazenda] = useState("");
  const [talhao, setTalhao] = useState("");
  const [maquinaId, setMaquinaId] = useState<string>(
    (params.maquina as any) || ""
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

    // Auto-preencher operador e fazenda com último usado
    if (lastLog) {
      setOperador(lastLog.operador || "");
      setFazenda(lastLog.fazenda || "");
    }
  }, [lastLog]);

  // Pré-preencher horímetros ao selecionar máquina
  useEffect(() => {
    if (maquinaId && machines) {
      const maquinaSelecionada = machines.find((m) => m.id === maquinaId);
      if (maquinaSelecionada) {
        setHmMotorInicial(maquinaSelecionada.hmMotorAtual?.toString() || "0");
        setHmTrilhaInicial(maquinaSelecionada.hmTrilhaAtual?.toString() || "0");
      }
    }
  }, [maquinaId, machines]);

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
    // Validação de campos obrigatórios
    if (!fazenda || !talhao || !operador) {
      Alert.alert("Erro", "Preencha os campos obrigatórios: Fazenda, Talhão e Operador");
      return;
    }

    // Validação rigorosa: horímetro final deve ser maior que inicial
    if (hmMotorInicial && hmMotorFinal) {
      const inicial = parseFloat(hmMotorInicial);
      const final = parseFloat(hmMotorFinal);
      if (final < inicial) {
        Alert.alert(
          "❌ Erro: Horímetro Inválido",
          `HM Motor Final (${final.toFixed(1)}h) não pode ser menor que HM Motor Inicial (${inicial.toFixed(1)}h).\n\nVerifique os valores e tente novamente.`
        );
        return;
      }
    }

    if (hmTrilhaInicial && hmTrilhaFinal) {
      const inicial = parseFloat(hmTrilhaInicial);
      const final = parseFloat(hmTrilhaFinal);
      if (final < inicial) {
        Alert.alert(
          "❌ Erro: Horímetro Inválido",
          `HM Trilha Final (${final.toFixed(1)}h) não pode ser menor que HM Trilha Inicial (${inicial.toFixed(1)}h).\n\nVerifique os valores e tente novamente.`
        );
        return;
      }
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

  const limparFormularioMantendoContexto = () => {
    const fazendaAtual = fazenda;
    const operadorAtual = operador;
    
    setTalhao("");
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
    
    // Manter fazenda e operador
    setFazenda(fazendaAtual);
    setOperador(operadorAtual);
    
    // Pré-preencher horímetros da máquina selecionada
    if (maquinaId && machines) {
      const maquinaSelecionada = machines.find((m) => m.id === maquinaId);
      if (maquinaSelecionada) {
        setHmMotorInicial(maquinaSelecionada.hmMotorAtual?.toString() || "0");
        setHmTrilhaInicial(maquinaSelecionada.hmTrilhaAtual?.toString() || "0");
      }
    }
  };

  const repetirUltimo = () => {
    if (!lastLog) {
      Alert.alert("Aviso", "Nenhum lançamento anterior encontrado");
      return;
    }
    // Preencher todos os campos com o último lançamento (exceto data)
    setFazenda(lastLog.fazenda || "");
    setTalhao(lastLog.talhao || "");
    setMaquinaId(lastLog.maquinaId || "");
    setOperador(lastLog.operador || "");
    setSaidaProgramada(lastLog.saidaProgramada || "");
    setSaidaReal(lastLog.saidaReal || "");
    setChegadaLavoura(lastLog.chegadaLavoura || "");
    setSaidaLavoura(lastLog.saidaLavoura || "");
    setHmMotorInicial(lastLog.hmMotorInicial?.toString() || "");
    setHmMotorFinal(lastLog.hmMotorFinal?.toString() || "");
    setHmTrilhaInicial(lastLog.hmTrilhaInicial?.toString() || "");
    setHmTrilhaFinal(lastLog.hmTrilhaFinal?.toString() || "");
    setProdH(lastLog.prodH?.toString() || "");
    setManH(lastLog.manH?.toString() || "");
    setChuvaH(lastLog.chuvaH?.toString() || "");
    setDeslocH(lastLog.deslocH?.toString() || "");
    setEsperaH(lastLog.esperaH?.toString() || "");
    setAbasteceu(lastLog.abasteceu || false);
    setAreaHa(lastLog.areaHa?.toString() || "");
    setObservacoes(lastLog.observacoes || "");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Sucesso", "Dados do último lançamento carregados!");
  };

  const salvarLancamento = async (saveAndNew: boolean) => {
    // Gerar UUID único para o lançamento
    const lancamentoId = uuidv4();
    
    const payload = {
      id: lancamentoId,
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
    };

    // Se offline, salvar localmente e adicionar à fila de sincronização
    if (!isOnline) {
      try {
        // Salvar no SQLite local
        saveDailyLogLocal(payload);
        
        // Adicionar à fila de sincronização com ID correto
        addToSyncQueue('daily_log', lancamentoId, payload);
        updatePendingCount();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "📵 Salvo Offline",
          "Lançamento salvo localmente. Será sincronizado quando houver conexão."
        );
        
        // Limpar formulário se for "Salvar e Novo"
        if (saveAndNew) {
          limparFormularioMantendoContexto();
        } else {
          router.back();
        }
        return;
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Erro", "Falha ao salvar offline");
        return;
      }
    }

    // Se online, salvar diretamente no servidor
    await createMutation.mutateAsync(payload);

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
      limparFormularioMantendoContexto();
    } else {
      router.back();
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-foreground">Lançamento Rápido</Text>
                <Text className="text-base text-muted">Registre as informações da colheita</Text>
              </View>
              <SyncIndicator />
            </View>
            <View className="flex-row items-center justify-end">
              {lastLog && (
                <Pressable
                  onPress={repetirUltimo}
                  style={({ pressed }) => [{
                    backgroundColor: pressed ? '#0a7ea4' : '#0a7ea4',
                    opacity: pressed ? 0.8 : 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                  }]}
                >
                  <Text className="text-white font-semibold text-sm">🔄 Repetir Último</Text>
                </Pressable>
              )}
            </View>
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
              <Text className="text-sm font-medium text-muted">Máquina *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={maquinaId}
                  onValueChange={(value) => setMaquinaId(value as any)}
                  style={{ color: '#11181C' }}
                >
                  <Picker.Item label="Selecione uma máquina" value="" />
                  {(machines || []).map((machine) => (
                    <Picker.Item
                      key={machine.id}
                      label={`${machine.id} - ${machine.nome} (${machine.tipo})`}
                      value={machine.id}
                    />
                  ))}
                </Picker>
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
