/**
 * Hook para gerenciar sincronização offline/online
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  getPendingSyncItems,
  markAsSynced,
  markAsError,
  countPendingItems,
  cleanupOldSyncedItems,
  retryFailedItems,
  clearErrorItems,
  markDailyLogSynced,
  markMaintenanceSynced,
} from '@/lib/sqlite';
import { trpc } from '@/lib/trpc';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

export const useSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Usar ref para evitar closures antigas
  const isSyncingRef = useRef(false);
  const isOnlineRef = useRef(true);

  const utils = trpc.useUtils();

  // Atualizar contagem de pendências e erros
  const updateCounts = useCallback(() => {
    const counts = countPendingItems();
    setPendingCount(counts.pending);
    setErrorCount(counts.errors);
    
    if (counts.pending === 0 && counts.errors === 0 && isOnlineRef.current) {
      setSyncStatus('synced');
    } else if (counts.errors > 0) {
      setSyncStatus('error');
    }
  }, []);

  // Sincronizar itens pendentes
  const syncPendingItems = useCallback(async () => {
    if (isSyncingRef.current || !isOnlineRef.current) {
      return;
    }

    try {
      isSyncingRef.current = true;
      setIsSyncing(true);
      setSyncStatus('syncing');

      const items = getPendingSyncItems();
      
      if (items.length === 0) {
        setSyncStatus('synced');
        setIsSyncing(false);
        isSyncingRef.current = false;
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
              // Marcar como sincronizado no espelho local
              if (payload.id) {
                markDailyLogSynced(payload.id);
              }
              break;
            
            case 'maintenance':
              await utils.client.maintenance.create.mutate(payload);
              // Marcar como sincronizado no espelho local
              if (payload.id) {
                markMaintenanceSynced(payload.id);
              }
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

          // Se falhar muitas vezes (>=5), não tentar mais
          if (item.attempts >= 4) {
            console.error(`⚠️ Item #${item.id} failed ${item.attempts + 1} times, will not retry automatically`);
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
      updateCounts();

      console.log('✅ Sync completed');

    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, [utils, updateCounts]);

  // Sincronizar automaticamente a cada 30 segundos se houver pendências
  useEffect(() => {
    if (!isOnlineRef.current) return;

    const interval = setInterval(() => {
      const counts = countPendingItems();
      if (counts.pending > 0 || counts.errors > 0) {
        syncPendingItems();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [syncPendingItems]);

  // Atualizar contagem ao montar
  useEffect(() => {
    updateCounts();
  }, [updateCounts]);

  // Retry manual de itens com erro
  const retryErrors = useCallback(async () => {
    const count = retryFailedItems();
    console.log(`🔄 Retrying ${count} failed items...`);
    updateCounts();
    
    // Tentar sincronizar imediatamente
    if (isOnlineRef.current) {
      await syncPendingItems();
    }
  }, [updateCounts, syncPendingItems]);

  // Limpar erros permanentemente
  const clearErrors = useCallback(() => {
    const count = clearErrorItems();
    console.log(`🗑️ Cleared ${count} error items`);
    updateCounts();
  }, [updateCounts]);

  // Monitorar conectividade
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      isOnlineRef.current = online;
      
      if (!online) {
        setSyncStatus('offline');
      } else {
        // Quando voltar online, tentar sincronizar
        syncPendingItems();
      }
    });

    return () => unsubscribe();
  }, [syncPendingItems]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    errorCount,
    isSyncing,
    syncNow: syncPendingItems,
    updatePendingCount: updateCounts,
    retryErrors,
    clearErrors,
  };
};
