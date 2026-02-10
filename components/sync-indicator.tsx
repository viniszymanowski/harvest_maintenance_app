/**
 * Componente de indicador de status de sincronização
 * Mostra: Offline / Sincronizado / Pendências: X
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSync } from '@/hooks/use-sync';
import { useColors } from '@/hooks/use-colors';

export function SyncIndicator() {
  const { isOnline, syncStatus, pendingCount, isSyncing, syncNow } = useSync();
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

    if (pendingCount > 0) {
      return {
        text: `⏳ Pendências: ${pendingCount}`,
        color: '#F59E0B', // warning
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    }

    if (syncStatus === 'error') {
      return {
        text: '❌ Erro na sincronização',
        color: '#EF4444', // error
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    }

    return {
      text: '✅ Sincronizado',
      color: '#22C55E', // success
      bgColor: 'rgba(34, 197, 94, 0.1)',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Pressable
      onPress={() => {
        if (isOnline && pendingCount > 0 && !isSyncing) {
          syncNow();
        }
      }}
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
    </Pressable>
  );
}
