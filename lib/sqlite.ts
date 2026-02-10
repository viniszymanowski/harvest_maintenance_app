/**
 * SQLite Local Database Configuration
 * 
 * Armazenamento local para operação offline
 * Sincronização automática quando online
 */

import * as SQLite from 'expo-sqlite';

// Abrir banco de dados local
export const db = SQLite.openDatabaseSync('harvest_app.db');

/**
 * Inicializar tabelas locais
 */
export const initDatabase = () => {
  try {
    // Tabela de fila de sincronização
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        payload_json TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_error TEXT,
        CHECK (status IN ('pending', 'sent', 'error'))
      );
    `);

    // Índices para performance
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status 
      ON sync_queue(status);
    `);

    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity 
      ON sync_queue(entity_type, entity_id);
    `);

    // Tabela local de daily_logs (espelho do servidor)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS daily_logs_local (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        fazenda TEXT,
        talhao TEXT,
        maquinaId TEXT,
        operador TEXT,
        saidaProgramada TEXT,
        saidaReal TEXT,
        chegadaLavoura TEXT,
        saidaLavoura TEXT,
        hmMotorInicial REAL,
        hmMotorFinal REAL,
        hmTrilhaInicial REAL,
        hmTrilhaFinal REAL,
        prodH REAL,
        manH REAL,
        chuvaH REAL,
        deslocH REAL,
        esperaH REAL,
        abasteceu INTEGER,
        areaHa REAL,
        observacoes TEXT,
        synced INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela local de maintenance (espelho do servidor)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS maintenance_local (
        id TEXT PRIMARY KEY,
        maquinaId TEXT NOT NULL,
        data TEXT NOT NULL,
        tipo TEXT NOT NULL,
        descricao TEXT,
        hmMotor REAL,
        synced INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ SQLite database initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/**
 * Adicionar item à fila de sincronização
 */
export const addToSyncQueue = (
  entityType: string,
  entityId: string | null,
  payload: any
) => {
  try {
    const result = db.runSync(
      `INSERT INTO sync_queue (entity_type, entity_id, payload_json, status, updated_at)
       VALUES (?, ?, ?, 'pending', datetime('now'))`,
      [entityType, entityId, JSON.stringify(payload)]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
};

/**
 * Obter itens pendentes da fila
 */
export const getPendingSyncItems = () => {
  try {
    const items = db.getAllSync<{
      id: number;
      entity_type: string;
      entity_id: string | null;
      payload_json: string;
      attempts: number;
    }>(
      `SELECT id, entity_type, entity_id, payload_json, attempts
       FROM sync_queue
       WHERE status = 'pending'
       ORDER BY updated_at ASC
       LIMIT 50`
    );
    return items;
  } catch (error) {
    console.error('Error getting pending sync items:', error);
    return [];
  }
};

/**
 * Marcar item como sincronizado
 */
export const markAsSynced = (id: number) => {
  try {
    db.runSync(
      `UPDATE sync_queue 
       SET status = 'sent', updated_at = datetime('now')
       WHERE id = ?`,
      [id]
    );
  } catch (error) {
    console.error('Error marking as synced:', error);
    throw error;
  }
};

/**
 * Marcar item como erro
 */
export const markAsError = (id: number, error: string) => {
  try {
    db.runSync(
      `UPDATE sync_queue 
       SET status = 'error', 
           attempts = attempts + 1,
           last_error = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      [error, id]
    );
  } catch (error) {
    console.error('Error marking as error:', error);
    throw error;
  }
};

/**
 * Contar itens pendentes
 */
export const countPendingItems = (): number => {
  try {
    const result = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error counting pending items:', error);
    return 0;
  }
};

/**
 * Limpar itens sincronizados antigos (mais de 7 dias)
 */
export const cleanupOldSyncedItems = () => {
  try {
    db.runSync(
      `DELETE FROM sync_queue 
       WHERE status = 'sent' 
       AND datetime(updated_at) < datetime('now', '-7 days')`
    );
  } catch (error) {
    console.error('Error cleaning up old synced items:', error);
  }
};
