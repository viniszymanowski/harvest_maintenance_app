/**
 * Componente de indicador de status de sincronização
 * Mostra: Offline / Sincronizando / Pendências:X / Erros:Y / Sincronizado
 * Ao tocar com erro, oferece: "Re-tentar falhas" e "Limpar erros"
 */

import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSync } from '@/hooks/use-sync';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

export function SyncIndicator() {
  const { 
    isOnline, 
    syncStatus, 
    pendingCount, 
    errorCount, 
    isSyncing, 
    syncNow,
    retryErrors,
    clearErrors,
  } = useSync();
  const colors = useColors();

  // Definir cor e texto baseado no status
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        text: '📵 Offline',
        color: '#F59E0B', // warning
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    }

    if (isSyncing) {
      return {
        text: '🔄 Sincronizando...',
        color: '#3B82F6', // blue
        bgColor: 'rgba(59, 130, 246, 0.1)',
      };
    }

    // Mostrar erros primeiro (prioridade)
    if (errorCount > 0) {
      return {
        text: `❌ Erros: ${errorCount}`,
        color: '#EF4444', // error
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    }

    if (pendingCount > 0) {
      return {
        text: `⏳ Pendências: ${pendingCount}`,
        color: '#F59E0B', // warning
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    }

    return {
      text: '✅ Sincronizado',
      color: '#22C55E', // success
      bgColor: 'rgba(34, 197, 94, 0.1)',
    };
  };

  const statusInfo = getStatusInfo();

  // Handler para clique
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Se houver erros, mostrar opções
    if (errorCount > 0) {
      Alert.alert(
        'Erros de Sincronização',
        `${errorCount} item(ns) falharam ao sincronizar.\n\nO que deseja fazer?`,
        [
          {
            text: 'Re-tentar Falhas',
            onPress: async () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await retryErrors();
            },
          },
          {
            text: 'Limpar Erros',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Confirmar',
                'Deseja remover permanentemente os itens com erro?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => {
                      clearErrors();
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    },
                  },
                ]
              );
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    // Se houver pendências e estiver online, sincronizar
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncNow();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          backgroundColor: statusInfo.bgColor,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
      ]}
    >
      {isSyncing && <ActivityIndicator size="small" color={statusInfo.color} />}
      <Text
        style={{
          color: statusInfo.color,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {statusInfo.text}
      </Text>
      
      {/* Mostrar ambos contadores quando houver pendências E erros */}
      {!isSyncing && pendingCount > 0 && errorCount > 0 && (
        <Text
          style={{
            color: '#EF4444',
            fontSize: 10,
            fontWeight: '600',
            marginLeft: 4,
          }}
        >
          ({errorCount} erros)
        </Text>
      )}
    </Pressable>
  );
}
