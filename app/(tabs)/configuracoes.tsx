import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Picker } from "@react-native-picker/picker";

type Tab = "fazendas" | "talhoes" | "maquinas" | "operadores";

export default function ConfiguracoesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("maquinas");

  const handleTabChange = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-6">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Configurações</Text>
          <Text className="text-base text-muted">Gerencie cadastros do sistema</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleTabChange("maquinas")}
              className={`px-6 py-4 rounded-xl ${
                activeTab === "maquinas" ? "bg-primary" : "bg-surface border-2 border-border"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  activeTab === "maquinas" ? "text-white" : "text-foreground"
                }`}
              >
                🚜 Máquinas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange("operadores")}
              className={`px-6 py-4 rounded-xl ${
                activeTab === "operadores" ? "bg-primary" : "bg-surface border-2 border-border"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  activeTab === "operadores" ? "text-white" : "text-foreground"
                }`}
              >
                👤 Operadores
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange("fazendas")}
              className={`px-6 py-4 rounded-xl ${
                activeTab === "fazendas" ? "bg-primary" : "bg-surface border-2 border-border"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  activeTab === "fazendas" ? "text-white" : "text-foreground"
                }`}
              >
                🌾 Fazendas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange("talhoes")}
              className={`px-6 py-4 rounded-xl ${
                activeTab === "talhoes" ? "bg-primary" : "bg-surface border-2 border-border"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  activeTab === "talhoes" ? "text-white" : "text-foreground"
                }`}
              >
                🗺️ Talhões
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Content */}
        <View className="flex-1">
          {activeTab === "maquinas" && <MaquinasTab />}
          {activeTab === "operadores" && <OperadoresTab />}
          {activeTab === "fazendas" && <FazendasTab />}
          {activeTab === "talhoes" && <TalhoesTab />}
        </View>
      </View>
    </ScreenContainer>
  );
}

// ============================================================================
// Máquinas Tab
// ============================================================================
function MaquinasTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    tipo: "Colheitadeira" as "Colheitadeira" | "Plataforma" | "Trator" | "Pulverizador",
    modelo: "",
    chassi: "",
    ano: "",
    fabricante: "",
    intervaloTrocaOleoHm: "250",
    intervaloRevisao50hHm: "50",
  });

  const utils = trpc.useUtils();
  const { data: machines, isLoading } = trpc.machines.list.useQuery();

  const createMutation = trpc.machines.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.machines.list.invalidate();
      setShowModal(false);
      resetForm();
      Alert.alert("Sucesso", "Máquina cadastrada com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const updateMutation = trpc.machines.updateName.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.machines.list.invalidate();
      setShowModal(false);
      resetForm();
      Alert.alert("Sucesso", "Máquina atualizada com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const deleteMutation = trpc.machines.delete.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.machines.list.invalidate();
      Alert.alert("Sucesso", "Máquina excluída com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      tipo: "Colheitadeira",
      modelo: "",
      chassi: "",
      ano: "",
      fabricante: "",
      intervaloTrocaOleoHm: "250",
      intervaloRevisao50hHm: "50",
    });
    setEditingMachine(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEdit = (machine: any) => {
    setEditingMachine(machine);
    setFormData({
      id: machine.id,
      nome: machine.nome || "",
      tipo: machine.tipo || "Colheitadeira",
      modelo: machine.modelo || "",
      chassi: machine.chassi || "",
      ano: machine.ano?.toString() || "",
      fabricante: machine.fabricante || "",
      intervaloTrocaOleoHm: machine.intervaloTrocaOleoHm?.toString() || "250",
      intervaloRevisao50hHm: machine.intervaloRevisao50hHm?.toString() || "50",
    });
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente excluir esta máquina?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id }),
      },
    ]);
  };

  const handleSave = () => {
    if (!formData.id || !formData.nome) {
      Alert.alert("Erro", "Preencha ID e Nome da máquina");
      return;
    }

    if (editingMachine) {
      updateMutation.mutate({
        id: formData.id,
        nome: formData.nome,
        intervaloTrocaOleoHm: parseFloat(formData.intervaloTrocaOleoHm) || 250,
        intervaloRevisao50hHm: parseFloat(formData.intervaloRevisao50hHm) || 50,
      });
    } else {
      createMutation.mutate({
        id: formData.id,
        nome: formData.nome,
        intervaloTrocaOleoHm: parseFloat(formData.intervaloTrocaOleoHm) || 250,
        intervaloRevisao50hHm: parseFloat(formData.intervaloRevisao50hHm) || 50,
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#367C2B" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Add Button */}
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className="bg-primary rounded-xl py-4 items-center mb-4 min-h-touch"
      >
        <Text className="text-lg font-bold text-white">➕ Adicionar Máquina</Text>
      </Pressable>

      {/* Machine List */}
      <FlatList
        data={machines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-surface rounded-2xl p-5 mb-4 border-2 border-border">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">{item.id}</Text>
                <Text className="text-lg text-foreground mt-1">{item.nome || "Sem nome"}</Text>
                {item.tipo && (
                  <View className="mt-2 self-start bg-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-sm font-semibold text-primary">{item.tipo}</Text>
                  </View>
                )}
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleEdit(item)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  className="bg-primary/20 px-4 py-2 rounded-lg"
                >
                  <Text className="text-sm font-semibold text-primary">✏️ Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  className="bg-error/20 px-4 py-2 rounded-lg"
                >
                  <Text className="text-sm font-semibold text-error">🗑️</Text>
                </Pressable>
              </View>
            </View>

            {/* Machine Details */}
            <View className="gap-2 mt-3 pt-3 border-t border-border">
              {item.modelo && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Modelo:</Text>
                  <Text className="text-sm font-semibold text-foreground">{item.modelo}</Text>
                </View>
              )}
              {item.chassi && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Chassi:</Text>
                  <Text className="text-sm font-semibold text-foreground">{item.chassi}</Text>
                </View>
              )}
              {item.ano && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Ano:</Text>
                  <Text className="text-sm font-semibold text-foreground">{item.ano}</Text>
                </View>
              )}
              {item.fabricante && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Fabricante:</Text>
                  <Text className="text-sm font-semibold text-foreground">{item.fabricante}</Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Troca Óleo:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item.intervaloTrocaOleoHm}h
                </Text>
              </View>
              
              {/* Horímetros Atuais */}
              <View className="mt-3 pt-3 border-t border-border gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-base font-bold text-primary">🕒 HM Motor Atual:</Text>
                  <Text className="text-base font-bold text-primary">
                    {item.hmMotorAtual?.toFixed(1) || "0.0"}h
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-base font-bold text-warning">⚙️ HM Trilha Atual:</Text>
                  <Text className="text-base font-bold text-warning">
                    {item.hmTrilhaAtual?.toFixed(1) || "0.0"}h
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Revisão 50h:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item.intervaloRevisao50hHm}h
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="bg-surface rounded-2xl p-8 items-center border-2 border-dashed border-border">
            <Text className="text-6xl mb-4">🚜</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Nenhuma máquina cadastrada
            </Text>
            <Text className="text-sm text-muted text-center">
              Adicione sua primeira máquina clicando no botão acima
            </Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="bg-primary p-6 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">
                {editingMachine ? "Editar Máquina" : "Nova Máquina"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                className="bg-white/20 px-4 py-2 rounded-lg"
              >
                <Text className="text-base font-semibold text-white">✕ Fechar</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="gap-4">
              {/* ID */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">
                  ID da Máquina *
                </Text>
                <TextInput
                  value={formData.id}
                  onChangeText={(text) => setFormData({ ...formData, id: text.toUpperCase() })}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                  placeholder="Ex: M1, M2, M3"
                  editable={!editingMachine}
                  maxLength={10}
                />
              </View>

              {/* Nome */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Nome *</Text>
                <TextInput
                  value={formData.nome}
                  onChangeText={(text) => setFormData({ ...formData, nome: text })}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                  placeholder="Ex: Colheitadeira John Deere S780"
                />
              </View>

              {/* Tipo */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Tipo</Text>
                <View className="bg-surface border-2 border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={formData.tipo}
                    onValueChange={(value: string) => setFormData({ ...formData, tipo: value as any })}
                    style={{ height: 56 }}
                  >
                    <Picker.Item label="Colheitadeira" value="Colheitadeira" />
                    <Picker.Item label="Plataforma" value="Plataforma" />
                    <Picker.Item label="Trator" value="Trator" />
                    <Picker.Item label="Pulverizador" value="Pulverizador" />
                  </Picker>
                </View>
              </View>

              {/* Modelo e Chassi */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-2">Modelo</Text>
                  <TextInput
                    value={formData.modelo}
                    onChangeText={(text) => setFormData({ ...formData, modelo: text })}
                    className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                    placeholder="Ex: S780"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-2">Ano</Text>
                  <TextInput
                    value={formData.ano}
                    onChangeText={(text) => setFormData({ ...formData, ano: text })}
                    className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                    placeholder="2024"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              {/* Chassi e Fabricante */}
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Chassi</Text>
                <TextInput
                  value={formData.chassi}
                  onChangeText={(text) => setFormData({ ...formData, chassi: text })}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                  placeholder="Número do chassi"
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Fabricante</Text>
                <TextInput
                  value={formData.fabricante}
                  onChangeText={(text) => setFormData({ ...formData, fabricante: text })}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                  placeholder="Ex: John Deere"
                />
              </View>

              {/* Manutenção */}
              <View className="bg-warning/10 p-4 rounded-xl border-2 border-warning/20 mt-4">
                <Text className="text-lg font-bold text-warning mb-3">⚙️ Manutenção</Text>
                <View className="gap-3">
                  <View>
                    <Text className="text-base font-semibold text-foreground mb-2">
                      Intervalo Troca Óleo (horas)
                    </Text>
                    <TextInput
                      value={formData.intervaloTrocaOleoHm}
                      onChangeText={(text) =>
                        setFormData({ ...formData, intervaloTrocaOleoHm: text })
                      }
                      className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                      placeholder="250"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground mb-2">
                      Intervalo Revisão 50h (horas)
                    </Text>
                    <TextInput
                      value={formData.intervaloRevisao50hHm}
                      onChangeText={(text) =>
                        setFormData({ ...formData, intervaloRevisao50hHm: text })
                      }
                      className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                      placeholder="50"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View className="gap-3 mt-4 mb-8">
                <Pressable
                  onPress={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-primary rounded-xl py-4 items-center min-h-touch"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      {editingMachine ? "💾 Salvar Alterações" : "➕ Cadastrar Máquina"}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowModal(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-surface border-2 border-border rounded-xl py-4 items-center"
                >
                  <Text className="text-lg font-semibold text-foreground">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// Operadores Tab
// ============================================================================
function OperadoresTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingOperador, setEditingOperador] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
  });

  const utils = trpc.useUtils();
  const { data: operadores, isLoading } = trpc.operadores.list.useQuery();

  const createMutation = trpc.operadores.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.operadores.list.invalidate();
      setShowModal(false);
      resetForm();
      Alert.alert("Sucesso", "Operador cadastrado com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const updateMutation = trpc.operadores.update.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.operadores.list.invalidate();
      setShowModal(false);
      resetForm();
      Alert.alert("Sucesso", "Operador atualizado com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const deleteMutation = trpc.operadores.delete.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.operadores.list.invalidate();
      Alert.alert("Sucesso", "Operador excluído com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      telefone: "",
    });
    setEditingOperador(null);
  };

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return text;
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return text;
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEdit = (operador: any) => {
    setEditingOperador(operador);
    setFormData({
      nome: operador.nome || "",
      cpf: operador.cpf || "",
      telefone: operador.telefone || "",
    });
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente excluir este operador?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id: id.toString() }),
      },
    ]);
  };

  const handleSave = () => {
    if (!formData.nome) {
      Alert.alert("Erro", "Preencha o nome do operador");
      return;
    }

    if (editingOperador) {
      updateMutation.mutate({
        id: editingOperador.id.toString(),
        nome: formData.nome,
        cpf: formData.cpf || null,
        telefone: formData.telefone || null,
      });
    } else {
      createMutation.mutate({
        nome: formData.nome,
        cpf: formData.cpf || null,
        telefone: formData.telefone || null,
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#367C2B" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Add Button */}
      <Pressable
        onPress={handleAdd}
        className="bg-primary rounded-2xl p-5 mb-6 active:opacity-80"
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
        <Text className="text-xl font-bold text-white text-center">➕ Adicionar Operador</Text>
      </Pressable>

      {/* Operador List */}
      {!operadores || operadores.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-6xl mb-4">👤</Text>
          <Text className="text-xl font-bold text-foreground mb-2">Nenhum operador cadastrado</Text>
          <Text className="text-base text-muted text-center">
            Clique em "Adicionar Operador" para começar
          </Text>
        </View>
      ) : (
        <FlatList
          data={operadores}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="bg-surface rounded-2xl p-5 mb-4 border-2 border-border">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground mb-1">{item.nome}</Text>
                  {item.cpf && (
                    <Text className="text-base text-muted">CPF: {item.cpf}</Text>
                  )}
                  {item.telefone && (
                    <Text className="text-base text-muted">Tel: {item.telefone}</Text>
                  )}

                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    className="bg-warning/20 p-3 rounded-xl"
                  >
                    <Text className="text-2xl">✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="bg-error/20 p-3 rounded-xl"
                  >
                    <Text className="text-2xl">🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal */}
      <Modal 
        visible={showModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="bg-primary p-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">
              {editingOperador ? "Editar Operador" : "Novo Operador"}
            </Text>
            <Pressable
              onPress={() => setShowModal(false)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="bg-white/20 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">✕</Text>
            </Pressable>
          </View>
          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>

              {/* Nome */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">Nome *</Text>
                <TextInput
                  value={formData.nome}
                  onChangeText={(text) => setFormData({ ...formData, nome: text })}
                  placeholder="Nome completo"
                  placeholderTextColor="#9BA1A6"
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                />
              </View>

              {/* CPF */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">CPF</Text>
                <TextInput
                  value={formData.cpf}
                  onChangeText={(text) => setFormData({ ...formData, cpf: formatCPF(text) })}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#9BA1A6"
                  keyboardType="numeric"
                  maxLength={14}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                />
              </View>

              {/* Telefone */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">Telefone</Text>
                <TextInput
                  value={formData.telefone}
                  onChangeText={(text) => setFormData({ ...formData, telefone: formatPhone(text) })}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#9BA1A6"
                  keyboardType="phone-pad"
                  maxLength={15}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                />
              </View>



              {/* Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-surface border-2 border-border rounded-xl p-4"
                >
                  <Text className="text-lg font-bold text-foreground text-center">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-1 bg-primary rounded-xl p-4"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white text-center">Salvar</Text>
                  )}
                </Pressable>
              </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ============================================================================
// Fazendas Tab (Existing)
// ============================================================================
function FazendasTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    localizacao: "",
  });

  const utils = trpc.useUtils();
  const { data: fazendas, isLoading } = trpc.fazendas.list.useQuery();

  const createMutation = trpc.fazendas.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.fazendas.list.invalidate();
      setShowModal(false);
      resetForm();
      Alert.alert("Sucesso", "Fazenda cadastrada com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const updateMutation = trpc.fazendas.update.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.fazendas.list.invalidate();
      setShowModal(false);
      resetForm();
      Alert.alert("Sucesso", "Fazenda atualizada com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const deleteMutation = trpc.fazendas.delete.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.fazendas.list.invalidate();
      Alert.alert("Sucesso", "Fazenda excluída com sucesso!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const resetForm = () => {
    setFormData({ nome: "", localizacao: "" });
    setEditingFazenda(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEdit = (fazenda: any) => {
    setEditingFazenda(fazenda);
    setFormData({
      nome: fazenda.nome,
      localizacao: fazenda.localizacao || "",
    });
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente excluir esta fazenda?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id: id.toString() }),
      },
    ]);
  };

  const handleSave = () => {
    if (!formData.nome) {
      Alert.alert("Erro", "Preencha o nome da fazenda");
      return;
    }

    if (editingFazenda) {
      updateMutation.mutate({
        id: editingFazenda.id.toString(),
        nome: formData.nome,
        localizacao: formData.localizacao,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#367C2B" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        className="bg-primary rounded-xl py-4 items-center mb-4 min-h-touch"
      >
        <Text className="text-lg font-bold text-white">➕ Adicionar Fazenda</Text>
      </Pressable>

      <FlatList
        data={fazendas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-surface rounded-2xl p-5 mb-4 border-2 border-border">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{item.nome}</Text>
                {item.localizacao && (
                  <Text className="text-sm text-muted mt-1">📍 {item.localizacao}</Text>
                )}
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleEdit(item)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  className="bg-primary/20 px-4 py-2 rounded-lg"
                >
                  <Text className="text-sm font-semibold text-primary">✏️</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  className="bg-error/20 px-4 py-2 rounded-lg"
                >
                  <Text className="text-sm font-semibold text-error">🗑️</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="bg-surface rounded-2xl p-8 items-center border-2 border-dashed border-border">
            <Text className="text-6xl mb-4">🌾</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Nenhuma fazenda cadastrada
            </Text>
            <Text className="text-sm text-muted text-center">
              Adicione sua primeira fazenda clicando no botão acima
            </Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="bg-primary p-6 pb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">
                {editingFazenda ? "Editar Fazenda" : "Nova Fazenda"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                className="bg-white/20 px-4 py-2 rounded-lg"
              >
                <Text className="text-base font-semibold text-white">✕ Fechar</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="gap-4">
              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Nome *</Text>
                <TextInput
                  value={formData.nome}
                  onChangeText={(text) => setFormData({ ...formData, nome: text })}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                  placeholder="Ex: Fazenda Santa Maria"
                />
              </View>

              <View>
                <Text className="text-base font-semibold text-foreground mb-2">Localização</Text>
                <TextInput
                  value={formData.localizacao}
                  onChangeText={(text) => setFormData({ ...formData, localizacao: text })}
                  className="bg-surface border-2 border-border rounded-xl px-4 py-4 text-lg text-foreground"
                  placeholder="Ex: Sorriso - MT"
                />
              </View>

              <View className="gap-3 mt-4 mb-8">
                <Pressable
                  onPress={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  className="bg-primary rounded-xl py-4 items-center min-h-touch"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      {editingFazenda ? "💾 Salvar" : "➕ Cadastrar"}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowModal(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-surface border-2 border-border rounded-xl py-4 items-center"
                >
                  <Text className="text-lg font-semibold text-foreground">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// Talhões Tab (Placeholder)
// ============================================================================
function TalhoesTab() {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-6xl mb-4">🗺️</Text>
      <Text className="text-xl font-bold text-foreground mb-2">Em Desenvolvimento</Text>
      <Text className="text-base text-muted text-center">
        Gerenciamento de talhões será implementado em breve
      </Text>
    </View>
  );
}
