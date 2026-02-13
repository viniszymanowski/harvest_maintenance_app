import localforage from "localforage";

/**
 * Web build: persist offline data in IndexedDB via LocalForage.
 * IMPORTANT: we avoid importing `expo-sqlite` on web because it pulls wa-sqlite WASM assets.
 */

type SyncQueueItem = {
  id: number;
  type: string;
  data: any;
  created_at: string;
  synced: number;
  error: string | null;
};

const KEYS = {
  dailyLogs: "hma:web:dailyLogs",
  maintenances: "hma:web:maintenances",
  syncQueue: "hma:web:syncQueue",
};

async function getArray(key: string) {
  const v = await localforage.getItem<any[]>(key);
  return Array.isArray(v) ? v : [];
}

async function setArray(key: string, value: any[]) {
  await localforage.setItem(key, value);
}

// Keep the same public API as the native implementation.
// On web, initDatabase is a no-op.
export function initDatabase(): null {
  return null;
}

export const saveDailyLogLocal = async (dailyLog: any) => {
  const items = await getArray(KEYS.dailyLogs);
  const id = Number(dailyLog?.id ?? Date.now());
  const next = [{ ...dailyLog, id }, ...items.filter((x) => Number(x?.id) !== id)];
  await setArray(KEYS.dailyLogs, next);
};

export const saveMaintenanceLocal = async (maintenance: any) => {
  const items = await getArray(KEYS.maintenances);
  const id = Number(maintenance?.id ?? Date.now());
  const next = [{ ...maintenance, id }, ...items.filter((x) => Number(x?.id) !== id)];
  await setArray(KEYS.maintenances, next);
};

export const getLocalDailyLogs = async () => {
  return await getArray(KEYS.dailyLogs);
};

export const getLocalMaintenances = async () => {
  return await getArray(KEYS.maintenances);
};

export const addToSyncQueue = async (type: string, data: any) => {
  const items = (await getArray(KEYS.syncQueue)) as SyncQueueItem[];
  const id = items.length ? Math.max(...items.map((x) => x.id)) + 1 : 1;
  const nextItem: SyncQueueItem = {
    id,
    type,
    data,
    created_at: new Date().toISOString(),
    synced: 0,
    error: null,
  };
  await setArray(KEYS.syncQueue, [nextItem, ...items]);
};

export const getSyncQueue = async () => {
  const items = (await getArray(KEYS.syncQueue)) as SyncQueueItem[];
  return items.filter((x) => x.synced !== 1);
};

export const markSyncQueueItemSynced = async (id: number) => {
  const items = (await getArray(KEYS.syncQueue)) as SyncQueueItem[];
  const next = items.map((x) => (x.id === id ? { ...x, synced: 1, error: null } : x));
  await setArray(KEYS.syncQueue, next);
};

export const markSyncQueueItemError = async (id: number, error: string) => {
  const items = (await getArray(KEYS.syncQueue)) as SyncQueueItem[];
  const next = items.map((x) => (x.id === id ? { ...x, error, synced: 0 } : x));
  await setArray(KEYS.syncQueue, next);
};

export const clearSyncQueue = async () => {
  await setArray(KEYS.syncQueue, []);
};
