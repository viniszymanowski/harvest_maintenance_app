/**
 * SQLite Local Database Configuration
 *
 * Offline storage for iOS/Android.
 * On Web we skip SQLite entirely (web bundlers can choke on wasm/worker deps).
 */

import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

let db: any = null;

/**
 * Lazy-load expo-sqlite ONLY on native.
 * Using eval('require') prevents Metro (web) from statically pulling the module.
 */
function loadSQLite() {
  const req = eval("require") as NodeRequire; // eslint-disable-line no-eval
  return req("expo-sqlite");
}

export function getDb() {
  if (isWeb) return null;
  if (db) return db;

  const SQLite = loadSQLite();
  db = SQLite.openDatabaseSync("harvest_app.db");
  return db;
}

export { db };

/**
 * Initialize local tables (native only).
 */
export const initDatabase = () => {
  if (isWeb) {
    console.log("✅ Web mode: SQLite disabled, using API only");
    return;
  }

  const _db = getDb();
  if (!_db) return;

  try {
    // Sync queue table
    _db.execSync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        payload_json TEXT NOT NULL,
        operation TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME,
        status TEXT DEFAULT 'pending'
      );
    `);

    // Cached launches
    _db.execSync(`
      CREATE TABLE IF NOT EXISTS cached_launches (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        farm TEXT,
        field TEXT,
        machine_id TEXT,
        operator TEXT,
        data_json TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cached machines
    _db.execSync(`
      CREATE TABLE IF NOT EXISTS cached_machines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        model TEXT,
        year INTEGER,
        serial_number TEXT,
        data_json TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ SQLite tables ready");
  } catch (error) {
    console.error("❌ SQLite init error:", error);
    throw error;
  }
};

/**
 * Convenience helpers (native only).
 */
export const queueSyncOperation = (entityType: string, entityId: string, payload: any, operation: string) => {
  if (isWeb) return;

  const _db = getDb();
  if (!_db) return;

  _db.runSync(
    `INSERT INTO sync_queue (entity_type, entity_id, payload_json, operation) VALUES (?, ?, ?, ?)`,
    [entityType, entityId, JSON.stringify(payload), operation],
  );
};

export const getPendingSyncOperations = () => {
  if (isWeb) return [];
  const _db = getDb();
  if (!_db) return [];
  return _db.getAllSync(`SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`);
};

export const markSyncOperationComplete = (id: number) => {
  if (isWeb) return;
  const _db = getDb();
  if (!_db) return;
  _db.runSync(`UPDATE sync_queue SET status = 'synced', synced_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
};
