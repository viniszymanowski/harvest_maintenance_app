/**
 * Hook para gerenciar sincronização offline/online
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  getPendingSyncItems,
  markAsSynced,
  markAsError,
  countPendingItems,
  cleanupOldSyncedItems,
} from '@/lib/sqlite';
import { trpc } from '@/lib/trpc';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

export const useSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const utils = trpc.useUtils();

  // Monitorar conectividade
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      
      if (!online) {
        setSyncStatus('offline');
      } else if (pendingCount > 0) {
        // Quando voltar online, tentar sincronizar
        syncPendingItems();
      } else {
        setSyncStatus('synced');
      }
    });

    return () => unsubscribe();
  }, [pendingCount]);

  // Atualizar contagem de pendências
  const updatePendingCount = useCallback(() => {
    const count = countPendingItems();
    setPendingCount(count);
    
    if (count === 0 && isOnline) {
      setSyncStatus('synced');
    }
  }, [isOnline]);

  // Sincronizar itens pendentes
  const syncPendingItems = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    try {
      setIsSyncing(true);
      setSyncStatus('syncing');

      const items = getPendingSyncItems();
      
      if (items.length === 0) {
        setSyncStatus('synced');
        setIsSyncing(false);
        return;
      }

      console.log(`🔄 Syncing ${items.length} pending items...`);

      for (const item of items) {
        try {
          const payload = JSON.parse(item.payload_json);

          // Sincronizar baseado no tipo de entidade
          switch (item.entity_type) {
            case 'daily_log':
              await utils.client.dailyLogs.create.mutate(payload);
              break;
            
            case 'maintenance':
              await utils.client.maintenance.create.mutate(payload);
              break;

            case 'machine_update':
              await utils.client.machines.updateName.mutate(payload);
              break;

            default:
              console.warn(`Unknown entity type: ${item.entity_type}`);
          }

          // Marcar como sincronizado
          markAsSynced(item.id);
          console.log(`✅ Synced ${item.entity_type} #${item.id}`);

        } catch (error: any) {
          // Marcar como erro
          const errorMsg = error?.message || 'Unknown error';
          markAsError(item.id, errorMsg);
          console.error(`❌ Error syncing item #${item.id}:`, errorMsg);

          // Se falhar muitas vezes (>5), parar tentativas
          if (item.attempts >= 5) {
            console.error(`⚠️ Item #${item.id} failed ${item.attempts} times, skipping`);
          }
        }
      }

      // Limpar itens antigos
      cleanupOldSyncedItems();

      // Invalidar cache para atualizar UI
      utils.dailyLogs.getByDate.invalidate();
      utils.maintenance.list.invalidate();
      utils.machines.list.invalidate();

      // Atualizar contagem
      updatePendingCount();

      setSyncStatus('synced');
      console.log('✅ Sync completed');

    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, utils]);

  // Sincronizar automaticamente a cada 30 segundos se houver pendências
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;

    const interval = setInterval(() => {
      syncPendingItems();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isOnline, pendingCount, syncPendingItems]);

  // Atualizar contagem ao montar
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    isSyncing,
    syncNow: syncPendingItems,
    updatePendingCount,
  };
};
