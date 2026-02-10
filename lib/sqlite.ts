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
        last_attempt_at TEXT,
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
 * Adicionar ou atualizar item na fila de sincronização (UPSERT)
 * Se já existe item pending/error para mesma entidade, atualiza payload e reseta status
 */
export const addToSyncQueue = (
  entityType: string,
  entityId: string | null,
  payload: any
) => {
  try {
    const payloadJson = JSON.stringify(payload);
    
    // Verificar se já existe item pending/error para esta entidade
    const existing = db.getFirstSync<{ id: number; status: string }>(
      `SELECT id, status FROM sync_queue 
       WHERE entity_type = ? AND entity_id = ? 
       AND status IN ('pending', 'error')
       LIMIT 1`,
      [entityType, entityId || '']
    );

    if (existing) {
      // UPSERT: Atualizar payload e resetar status para pending
      db.runSync(
        `UPDATE sync_queue 
         SET payload_json = ?, 
             status = 'pending', 
             attempts = 0,
             last_error = NULL,
             updated_at = datetime('now')
         WHERE id = ?`,
        [payloadJson, existing.id]
      );
      return existing.id;
    } else {
      // INSERT: Novo item
      const result = db.runSync(
        `INSERT INTO sync_queue (entity_type, entity_id, payload_json, status, updated_at)
         VALUES (?, ?, ?, 'pending', datetime('now'))`,
        [entityType, entityId || '', payloadJson]
      );
      return result.lastInsertRowId;
    }
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
};

/**
 * Obter itens pendentes da fila (pending + error com attempts < 5 e cooldown)
 * Cooldown: 30 segundos entre tentativas
 */
export const getPendingSyncItems = () => {
  try {
    const items = db.getAllSync<{
      id: number;
      entity_type: string;
      entity_id: string | null;
      payload_json: string;
      attempts: number;
      status: string;
    }>(
      `SELECT id, entity_type, entity_id, payload_json, attempts, status
       FROM sync_queue
       WHERE (status = 'pending' OR (status = 'error' AND attempts < 5))
       AND (last_attempt_at IS NULL OR 
            datetime(last_attempt_at, '+30 seconds') < datetime('now'))
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
 * Marcar item como erro e incrementar tentativas
 */
export const markAsError = (id: number, error: string) => {
  try {
    db.runSync(
      `UPDATE sync_queue 
       SET status = 'error', 
           attempts = attempts + 1,
           last_error = ?,
           last_attempt_at = datetime('now'),
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
 * Contar itens pendentes e erros separadamente
 */
export const countPendingItems = (): { pending: number; errors: number } => {
  try {
    const pendingResult = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`
    );
    
    const errorResult = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'error' AND attempts < 5`
    );
    
    return {
      pending: pendingResult?.count || 0,
      errors: errorResult?.count || 0,
    };
  } catch (error) {
    console.error('Error counting pending items:', error);
    return { pending: 0, errors: 0 };
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

/**
 * Resetar itens com erro para pending (retry manual)
 */
export const retryFailedItems = () => {
  try {
    const result = db.runSync(
      `UPDATE sync_queue 
       SET status = 'pending', 
           attempts = 0, 
           last_error = NULL,
           last_attempt_at = NULL,
           updated_at = datetime('now')
       WHERE status = 'error'`
    );
    return result.changes;
  } catch (error) {
    console.error('Error retrying failed items:', error);
    return 0;
  }
};

/**
 * Limpar todos os erros permanentemente
 */
export const clearErrorItems = () => {
  try {
    const result = db.runSync(
      `DELETE FROM sync_queue WHERE status = 'error'`
    );
    return result.changes;
  } catch (error) {
    console.error('Error clearing error items:', error);
    return 0;
  }
};

// ============================================================================
// Funções de Espelho Local - Daily Logs
// ============================================================================

/**
 * Salvar daily log localmente
 */
export const saveDailyLogLocal = (log: any) => {
  try {
    const id = log.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.runSync(
      `INSERT OR REPLACE INTO daily_logs_local (
        id, data, fazenda, talhao, maquinaId, operador,
        saidaProgramada, saidaReal, chegadaLavoura, saidaLavoura,
        hmMotorInicial, hmMotorFinal, hmTrilhaInicial, hmTrilhaFinal,
        prodH, manH, chuvaH, deslocH, esperaH, abasteceu, areaHa, observacoes,
        synced, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        id, log.data, log.fazenda, log.talhao, log.maquinaId, log.operador,
        log.saidaProgramada, log.saidaReal, log.chegadaLavoura, log.saidaLavoura,
        log.hmMotorInicial, log.hmMotorFinal, log.hmTrilhaInicial, log.hmTrilhaFinal,
        log.prodH, log.manH, log.chuvaH, log.deslocH, log.esperaH,
        log.abasteceu ? 1 : 0, log.areaHa, log.observacoes
      ]
    );
    
    return id;
  } catch (error) {
    console.error('Error saving daily log locally:', error);
    throw error;
  }
};

/**
 * Buscar daily logs locais (incluindo sincronizados quando includeSynced=true)
 */
export const getLocalDailyLogs = (date?: string, includeSynced: boolean = false) => {
  try {
    let query = `SELECT * FROM daily_logs_local`;
    const params: any[] = [];
    const conditions: string[] = [];
    
    // Filtrar por synced se necessário
    if (!includeSynced) {
      conditions.push('synced = 0');
    }
    
    // Filtrar por data se fornecida
    if (date) {
      conditions.push('data = ?');
      params.push(date);
    }
    
    // Adicionar condições à query
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY updated_at DESC`;
    
    return db.getAllSync(query, params);
  } catch (error) {
    console.error('Error getting local daily logs:', error);
    return [];
  }
};

/**
 * Marcar daily log como sincronizado
 */
export const markDailyLogSynced = (id: string) => {
  try {
    db.runSync(
      `UPDATE daily_logs_local SET synced = 1, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  } catch (error) {
    console.error('Error marking daily log as synced:', error);
  }
};

// ============================================================================
// Funções de Espelho Local - Maintenance
// ============================================================================

/**
 * Salvar maintenance localmente
 */
export const saveMaintenanceLocal = (maintenance: any) => {
  try {
    const id = maintenance.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    db.runSync(
      `INSERT OR REPLACE INTO maintenance_local (
        id, maquinaId, data, tipo, hmMotor, synced, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        id, maintenance.maquinaId, maintenance.data, maintenance.tipo,
        maintenance.hmMotor
      ]
    );
    
    return id;
  } catch (error) {
    console.error('Error saving maintenance locally:', error);
    throw error;
  }
};

/**
 * Buscar maintenances locais não sincronizados
 */
export const getLocalMaintenances = () => {
  try {
    return db.getAllSync(
      `SELECT * FROM maintenance_local WHERE synced = 0 ORDER BY updated_at DESC`
    );
  } catch (error) {
    console.error('Error getting local maintenances:', error);
    return [];
  }
};

/**
 * Marcar maintenance como sincronizado
 */
export const markMaintenanceSynced = (id: string) => {
  try {
    db.runSync(
      `UPDATE maintenance_local SET synced = 1, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  } catch (error) {
    console.error('Error marking maintenance as synced:', error);
  }
};
