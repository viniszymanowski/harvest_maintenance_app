import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  real,
  text,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// Machines Table - M1, M2, M3, M4
// ============================================================================
export const machines = mysqlTable("machines", {
  id: varchar("id", { length: 10 }).primaryKey(), // M1, M2, M3, M4
  nome: varchar("nome", { length: 100 }),
  intervaloTrocaOleoHm: real("intervaloTrocaOleoHm").default(250).notNull(),
  intervaloRevisao50hHm: real("intervaloRevisao50hHm").default(50).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// Daily Logs Table - Lançamentos diários de colheita
// ============================================================================
export const dailyLogs = mysqlTable("daily_logs", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  data: date("data").notNull(),
  fazenda: text("fazenda").notNull(),
  talhao: text("talhao").notNull(),
  maquinaId: varchar("maquinaId", { length: 10 })
    .notNull()
    .references(() => machines.id),
  operador: text("operador").notNull(),
  saidaProgramada: time("saidaProgramada"),
  saidaReal: time("saidaReal"),
  chegadaLavoura: time("chegadaLavoura"),
  
  // Horímetros
  hmMotorInicial: real("hmMotorInicial"),
  hmMotorFinal: real("hmMotorFinal"),
  hmTrilhaInicial: real("hmTrilhaInicial"),
  hmTrilhaFinal: real("hmTrilhaFinal"),
  
  // Horas do dia
  prodH: real("prodH").default(0).notNull(),
  manH: real("manH").default(0).notNull(),
  chuvaH: real("chuvaH").default(0).notNull(),
  deslocH: real("deslocH").default(0).notNull(),
  esperaH: real("esperaH").default(0).notNull(),
  
  // Outros
  abasteceu: boolean("abasteceu").default(false).notNull(),
  areaHa: real("areaHa"),
  observacoes: text("observacoes"),
  
  // Campos calculados
  horasMotorDia: real("horasMotorDia"),
  horasTrilhaDia: real("horasTrilhaDia"),
  atrasoMin: int("atrasoMin"),
  divergente: boolean("divergente").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// Maintenance Table - Manutenções das máquinas
// ============================================================================
export const maintenance = mysqlTable("maintenance", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  data: date("data").notNull(),
  maquinaId: varchar("maquinaId", { length: 10 })
    .notNull()
    .references(() => machines.id),
  tipo: mysqlEnum("tipo", ["preventiva", "corretiva_leve", "corretiva_pesada"]).notNull(),
  hmMotorNoServico: real("hmMotorNoServico").notNull(),
  tempoParadoH: real("tempoParadoH").notNull(),
  trocaOleo: boolean("trocaOleo").default(false).notNull(),
  revisao50h: boolean("revisao50h").default(false).notNull(),
  proximaTrocaOleoHm: real("proximaTrocaOleoHm"),
  proximaRevisao50hHm: real("proximaRevisao50hHm"),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// Maintenance Parts Table - Peças utilizadas nas manutenções
// ============================================================================
export const maintenanceParts = mysqlTable("maintenance_parts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  maintenanceId: varchar("maintenanceId", { length: 36 })
    .notNull()
    .references(() => maintenance.id, { onDelete: "cascade" }),
  nomePeca: text("nomePeca").notNull(),
  qtde: real("qtde").notNull(),
  valorUnit: real("valorUnit"),
  valorTotal: real("valorTotal"),
});

// ============================================================================
// Type Exports
// ============================================================================
export type Machine = typeof machines.$inferSelect;
export type InsertMachine = typeof machines.$inferInsert;

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = typeof maintenance.$inferInsert;

export type MaintenancePart = typeof maintenanceParts.$inferSelect;
export type InsertMaintenancePart = typeof maintenanceParts.$inferInsert;
