import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import * as Haptics from "expo-haptics";

export default function ConfiguracoesScreen() {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<{
    id: string;
    nome: string | null;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");

  const utils = trpc.useUtils();
  const { data: machines, isLoading } = trpc.machines.list.useQuery();

  const updateNameMutation = trpc.machines.updateName.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.machines.list.invalidate();
      setEditModalVisible(false);
      Alert.alert("Sucesso", "Nome da máquina atualizado!");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message);
    },
  });

  const createMutation = trpc.machines.create.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.machines.list.invalidate();
      setCreateModalVisible(false);
      setNewId("");
      setNewName("");
      Alert.alert("Sucesso", "Máquina cadastrada com sucesso!");
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

  const handleEditPress = (machine: { id: string; nome: string | null }) => {
    setSelectedMachine(machine);
    setEditName(machine.nome || "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!selectedMachine || !editName.trim()) {
      Alert.alert("Erro", "Digite um nome para a máquina");
      return;
    }
    updateNameMutation.mutate({ id: selectedMachine.id, nome: editName.trim() });
  };

  const handleCreateMachine = () => {
    if (!newId.trim() || !newName.trim()) {
      Alert.alert("Erro", "Preencha o ID e o nome da máquina");
      return;
    }
    createMutation.mutate({
      id: newId.trim().toUpperCase(),
      nome: newName.trim(),
      intervaloTrocaOleoHm: 250,
      intervaloRevisao50hHm: 50,
    });
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente excluir esta máquina? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
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
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Configurações</Text>
          <Text className="text-base text-muted">Gerencie suas máquinas</Text>
        </View>

        {/* Add Button */}
        <Pressable
          onPress={() => setCreateModalVisible(true)}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          className="bg-primary rounded-2xl p-4 flex-row items-center justify-center gap-2"
        >
          <IconSymbol name="plus" size={24} color="#fff" />
          <Text className="text-lg font-bold text-white">Cadastrar Nova Máquina</Text>
        </Pressable>

        {/* Machines List */}
        <FlatList
          data={machines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-surface rounded-2xl p-5 mb-4 border border-border">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground">{item.id}</Text>
                  <Text className="text-base text-muted mt-1">{item.nome || "Sem nome"}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleEditPress(item)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    className="bg-primary/20 p-3 rounded-xl"
                  >
                    <IconSymbol name="pencil" size={20} color="#10B981" />
                  </Pressable>
                  {!["M1", "M2", "M3", "M4"].includes(item.id) && (
                    <Pressable
                      onPress={() => handleDeletePress(item.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      className="bg-error/20 p-3 rounded-xl"
                    >
                      <IconSymbol name="trash" size={20} color="#EF4444" />
                    </Pressable>
                  )}
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Intervalo Troca Óleo</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {item.intervaloTrocaOleoHm}h
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Intervalo Revisão 50h</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {item.intervaloRevisao50hHm}h
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-background rounded-3xl p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-foreground mb-4">Editar Nome</Text>

            <View className="gap-2 mb-6">
              <Text className="text-sm font-medium text-muted">ID da Máquina</Text>
              <View className="bg-surface border border-border rounded-xl px-4 py-3">
                <Text className="text-foreground font-semibold">{selectedMachine?.id}</Text>
              </View>
            </View>

            <View className="gap-2 mb-6">
              <Text className="text-sm font-medium text-muted">Nome</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Digite o nome da máquina"
                autoFocus
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1 bg-surface border border-border rounded-xl p-4 items-center"
              >
                <Text className="font-semibold text-foreground">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={updateNameMutation.isPending}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                className="flex-1 bg-primary rounded-xl p-4 items-center"
              >
                {updateNameMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-semibold text-white">Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-background rounded-3xl p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-foreground mb-4">Nova Máquina</Text>

            <View className="gap-2 mb-4">
              <Text className="text-sm font-medium text-muted">ID da Máquina *</Text>
              <TextInput
                value={newId}
                onChangeText={setNewId}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Ex: M5, M6, TRATOR1"
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>

            <View className="gap-2 mb-6">
              <Text className="text-sm font-medium text-muted">Nome *</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Digite o nome da máquina"
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewId("");
                  setNewName("");
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1 bg-surface border border-border rounded-xl p-4 items-center"
              >
                <Text className="font-semibold text-foreground">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateMachine}
                disabled={createMutation.isPending}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                className="flex-1 bg-primary rounded-xl p-4 items-center"
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-semibold text-white">Cadastrar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
