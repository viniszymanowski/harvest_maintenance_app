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

type Tab = "fazendas" | "talhoes" | "maquinas" | "operadores";

export default function ConfiguracoesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("fazendas");

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
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleTabChange("fazendas")}
              className={`px-5 py-3 rounded-full ${
                activeTab === "fazendas" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === "fazendas" ? "text-white" : "text-foreground"
                }`}
              >
                🌾 Fazendas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange("talhoes")}
              className={`px-5 py-3 rounded-full ${
                activeTab === "talhoes" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === "talhoes" ? "text-white" : "text-foreground"
                }`}
              >
                🗺️ Talhões
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange("maquinas")}
              className={`px-5 py-3 rounded-full ${
                activeTab === "maquinas" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === "maquinas" ? "text-white" : "text-foreground"
                }`}
              >
                🚜 Máquinas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange("operadores")}
              className={`px-5 py-3 rounded-full ${
                activeTab === "operadores" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === "operadores" ? "text-white" : "text-foreground"
                }`}
              >
                👤 Operadores
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Content */}
        <View className="flex-1">
          {activeTab === "fazendas" && <FazendasTab />}
          {activeTab === "talhoes" && <TalhoesTab />}
          {activeTab === "maquinas" && <MaquinasTab />}
          {activeTab === "operadores" && <OperadoresTab />}
        </View>
      </View>
    </ScreenContainer>
  );
}

// ============================================================================
// Fazendas Tab
// ============================================================================
function FazendasTab() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [areaTotal, setAreaTotal] = useState("");

  const utils = trpc.useUtils();
  const { data: fazendas, isLoading } = trpc.fazendas.list.useQuery();

  const createMutation = trpc.fazendas.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.fazendas.list.invalidate();
      closeModal();
      Alert.alert("Sucesso", "Fazenda cadastrada!");
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
      closeModal();
      Alert.alert("Sucesso", "Fazenda atualizada!");
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
      Alert.alert("Sucesso", "Fazenda excluída!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const openModal = (fazenda?: any) => {
    if (fazenda) {
      setEditingId(fazenda.id);
      setNome(fazenda.nome);
      setLocalizacao(fazenda.localizacao || "");
      setAreaTotal(fazenda.areaTotal?.toString() || "");
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setNome("");
    setLocalizacao("");
    setAreaTotal("");
  };

  const handleSave = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Digite o nome da fazenda");
      return;
    }

    const data = {
      nome: nome.trim(),
      localizacao: localizacao.trim() || null,
      areaTotal: areaTotal ? parseFloat(areaTotal) : null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente excluir esta fazenda?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View className="flex-1 gap-4">
      <Pressable
        onPress={() => openModal()}
        style={({ pressed }) => [
          { transform: [{ scale: pressed ? 0.97 : 1 }], opacity: pressed ? 0.9 : 1 },
        ]}
        className="bg-primary rounded-2xl p-4 items-center"
      >
        <Text className="text-lg font-bold text-white">+ Nova Fazenda</Text>
      </Pressable>

      <FlatList
        data={fazendas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-surface rounded-2xl p-5 mb-3 border border-border">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{item.nome}</Text>
                {item.localizacao && (
                  <Text className="text-sm text-muted mt-1">📍 {item.localizacao}</Text>
                )}
                {item.areaTotal && (
                  <Text className="text-sm text-muted mt-1">📐 {item.areaTotal} ha</Text>
                )}
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => openModal(item)}
                  className="bg-primary/20 px-3 py-2 rounded-lg"
                >
                  <Text className="text-primary font-semibold">✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="bg-error/20 px-3 py-2 rounded-lg"
                >
                  <Text className="text-error font-semibold">🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">🌾</Text>
            <Text className="text-lg font-semibold text-muted">Nenhuma fazenda cadastrada</Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-background rounded-3xl p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-foreground mb-6">
              {editingId ? "Editar Fazenda" : "Nova Fazenda"}
            </Text>

            <View className="gap-4 mb-6">
              <View>
                <Text className="text-sm font-medium text-muted mb-2">Nome *</Text>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="Ex: Fazenda Santa Maria"
                  autoFocus
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-muted mb-2">Localização</Text>
                <TextInput
                  value={localizacao}
                  onChangeText={setLocalizacao}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="Ex: Zona Rural, Cidade - UF"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-muted mb-2">Área Total (ha)</Text>
                <TextInput
                  value={areaTotal}
                  onChangeText={setAreaTotal}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="Ex: 500"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1 bg-surface border border-border rounded-xl p-4 items-center"
              >
                <Text className="font-semibold text-foreground">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }], opacity: pressed ? 0.9 : 1 },
                ]}
                className="flex-1 bg-primary rounded-xl p-4 items-center"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-semibold text-white">Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// Talhões Tab
// ============================================================================
function TalhoesTab() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-6xl mb-4">🗺️</Text>
      <Text className="text-lg font-semibold text-muted">Em desenvolvimento</Text>
      <Text className="text-sm text-muted mt-2">Cadastro de talhões em breve</Text>
    </View>
  );
}

// ============================================================================
// Máquinas Tab
// ============================================================================
function MaquinasTab() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-6xl mb-4">🚜</Text>
      <Text className="text-lg font-semibold text-muted">Em desenvolvimento</Text>
      <Text className="text-sm text-muted mt-2">Cadastro de máquinas em breve</Text>
    </View>
  );
}

// ============================================================================
// Operadores Tab
// ============================================================================
function OperadoresTab() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-6xl mb-4">👤</Text>
      <Text className="text-lg font-semibold text-muted">Em desenvolvimento</Text>
      <Text className="text-sm text-muted mt-2">Cadastro de operadores em breve</Text>
    </View>
  );
}
