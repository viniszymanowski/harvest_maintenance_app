import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  appSettings,
  dailyLogs,
  fazendas,
  talhoes,
  operadores,
  InsertAppSettings,
  InsertDailyLog,
  InsertFazenda,
  InsertTalhao,
  InsertOperador,
  InsertMachine,
  InsertMaintenance,
  InsertMaintenancePart,
  InsertUser,
  machines,
  maintenance,
  maintenanceParts,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Machines
// ============================================================================

export async function getAllMachines() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(machines).orderBy(machines.id);
}

export async function getMachineById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(machines).where(eq(machines.id, id));
  return result[0] || null;
}

export async function updateMachine(id: string, data: Partial<InsertMachine>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(machines).set(data).where(eq(machines.id, id));
}

export async function createMachine(data: InsertMachine) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se já existe
  const existing = await getMachineById(data.id);
  if (existing) {
    throw new Error(`Máquina ${data.id} já existe`);
  }
  
  await db.insert(machines).values(data);
  return data;
}

export async function deleteMachine(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se é uma das máquinas padrão
  if (["M1", "M2", "M3", "M4"].includes(id)) {
    throw new Error("Não é possível excluir máquinas padrão");
  }
  
  await db.delete(machines).where(eq(machines.id, id));
}

export async function initializeMachines() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const machineIds = ["M1", "M2", "M3", "M4"];
  
  for (const id of machineIds) {
    const existing = await getMachineById(id);
    if (!existing) {
      await db.insert(machines).values({
        id,
        nome: `Máquina ${id}`,
        intervaloTrocaOleoHm: 250,
        intervaloRevisao50hHm: 50,
      });
    }
  }
}

// ============================================================================
// Daily Logs
// ============================================================================

function calculateDailyLogFields(data: InsertDailyLog): Partial<InsertDailyLog> {
  const calculated: Partial<InsertDailyLog> = {};

  // Calcular horas motor dia
  if (data.hmMotorInicial != null && data.hmMotorFinal != null) {
    calculated.horasMotorDia = data.hmMotorFinal - data.hmMotorInicial;
  }

  // Calcular horas trilha dia
  if (data.hmTrilhaInicial != null && data.hmTrilhaFinal != null) {
    calculated.horasTrilhaDia = data.hmTrilhaFinal - data.hmTrilhaInicial;
  }

  // Calcular atraso em minutos
  if (data.saidaProgramada && data.saidaReal) {
    const [progH, progM] = data.saidaProgramada.split(":").map(Number);
    const [realH, realM] = data.saidaReal.split(":").map(Number);
    const progMinutes = progH * 60 + progM;
    const realMinutes = realH * 60 + realM;
    calculated.atrasoMin = realMinutes - progMinutes;
  }

  // Verificar divergência
  if (calculated.horasMotorDia != null) {
    const somaHoras =
      (data.prodH || 0) +
      (data.manH || 0) +
      (data.chuvaH || 0) +
      (data.deslocH || 0) +
      (data.esperaH || 0);
    const diferenca = Math.abs(somaHoras - calculated.horasMotorDia);
    calculated.divergente = diferenca > 0.5;
  }

  return calculated;
}

export async function createDailyLog(data: InsertDailyLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const calculated = calculateDailyLogFields(data);
  const finalData = { ...data, ...calculated };

  await db.insert(dailyLogs).values(finalData);
  
  // Atualizar horímetros da máquina automaticamente
  if (data.maquinaId) {
    const hmMotorFinal = parseFloat(data.hmMotorFinal?.toString() || "0");
    const hmTrilhaFinal = parseFloat(data.hmTrilhaFinal?.toString() || "0");
    
    await db.update(machines)
      .set({
        hmMotorAtual: hmMotorFinal,
        hmTrilhaAtual: hmTrilhaFinal,
      })
      .where(eq(machines.id, data.maquinaId));
  }
  
  return finalData;
}

export async function getDailyLogsByDate(date: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyLogs).where(eq(dailyLogs.data, sql`${date}`));
}

export async function getLastDailyLog() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dailyLogs).orderBy(sql`${dailyLogs.data} DESC, ${dailyLogs.createdAt} DESC`).limit(1);
  return result[0] || null;
}

export async function getDailyLogById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dailyLogs).where(eq(dailyLogs.id, id));
  return result[0] || null;
}

export async function updateDailyLog(id: string, data: Partial<InsertDailyLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar dados existentes para recalcular
  const existing = await getDailyLogById(id);
  if (!existing) throw new Error("Daily log not found");

  const merged = { ...existing, ...data };
  const calculated = calculateDailyLogFields(merged);
  const finalData = { ...data, ...calculated };

  await db.update(dailyLogs).set(finalData).where(eq(dailyLogs.id, id));
  return finalData;
}

export async function deleteDailyLog(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(dailyLogs).where(eq(dailyLogs.id, id));
}

export async function getDailyLogsByPeriod(from: string, to: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyLogs)
    .where(and(gte(dailyLogs.data, sql`${from}`), lte(dailyLogs.data, sql`${to}`)));
}

// ============================================================================
// Maintenance
// ============================================================================

async function calculateNextMaintenance(
  maquinaId: string,
  hmMotorNoServico: number,
  trocaOleo: boolean,
  revisao50h: boolean
): Promise<{ proximaTrocaOleoHm?: number; proximaRevisao50hHm?: number }> {
  const machine = await getMachineById(maquinaId);
  if (!machine) return {};

  const result: { proximaTrocaOleoHm?: number; proximaRevisao50hHm?: number } = {};

  if (trocaOleo) {
    result.proximaTrocaOleoHm = hmMotorNoServico + machine.intervaloTrocaOleoHm;
  }

  if (revisao50h) {
    result.proximaRevisao50hHm = hmMotorNoServico + machine.intervaloRevisao50hHm;
  }

  return result;
}

export async function createMaintenance(data: InsertMaintenance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const nextMaintenance = await calculateNextMaintenance(
    data.maquinaId,
    data.hmMotorNoServico,
    data.trocaOleo || false,
    data.revisao50h || false
  );

  const finalData = { ...data, ...nextMaintenance };
  await db.insert(maintenance).values(finalData);
  return finalData;
}

export async function getMaintenanceById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(maintenance).where(eq(maintenance.id, id));
  return result[0] || null;
}

export async function updateMaintenance(id: string, data: Partial<InsertMaintenance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getMaintenanceById(id);
  if (!existing) throw new Error("Maintenance not found");

  const merged = { ...existing, ...data };
  const nextMaintenance = await calculateNextMaintenance(
    merged.maquinaId,
    merged.hmMotorNoServico,
    merged.trocaOleo,
    merged.revisao50h
  );

  const finalData = { ...data, ...nextMaintenance };
  await db.update(maintenance).set(finalData).where(eq(maintenance.id, id));
  return finalData;
}

export async function deleteMaintenance(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(maintenance).where(eq(maintenance.id, id));
}

export async function getMaintenanceByMachineAndPeriod(
  maquinaId: string,
  from: string,
  to: string
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(maintenance)
    .where(
      and(
        eq(maintenance.maquinaId, maquinaId),
        gte(maintenance.data, sql`${from}`),
        lte(maintenance.data, sql`${to}`)
      )
    )
    .orderBy(desc(maintenance.data));
}

export async function getAllMaintenance() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(maintenance).orderBy(desc(maintenance.data));
}

export async function getLatestMaintenanceByMachine(maquinaId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(maintenance)
    .where(eq(maintenance.maquinaId, maquinaId))
    .orderBy(desc(maintenance.data))
    .limit(1);
  return result[0] || null;
}

export async function getCurrentHorimeter(maquinaId: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Buscar último lançamento com horímetro final
  const result = await db
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.maquinaId, maquinaId),
        sql`${dailyLogs.hmMotorFinal} IS NOT NULL`
      )
    )
    .orderBy(desc(dailyLogs.data))
    .limit(1);
  
  return result[0]?.hmMotorFinal || null;
}

export async function getAllMaintenanceByPeriod(from: string, to: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(maintenance)
    .where(and(gte(maintenance.data, sql`${from}`), lte(maintenance.data, sql`${to}`)))
    .orderBy(desc(maintenance.data));
}

// ============================================================================
// Maintenance Parts
// ============================================================================

export async function createMaintenancePart(data: InsertMaintenancePart) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calcular valor total
  const valorTotal =
    data.valorUnit != null && data.qtde != null ? data.valorUnit * data.qtde : null;

  const finalData = { ...data, valorTotal };
  await db.insert(maintenanceParts).values(finalData);
  return finalData;
}

export async function getMaintenancePartsByMaintenanceId(maintenanceId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(maintenanceParts)
    .where(eq(maintenanceParts.maintenanceId, maintenanceId));
}

export async function updateMaintenancePart(id: string, data: Partial<InsertMaintenancePart>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Recalcular valor total se necessário
  if (data.valorUnit != null || data.qtde != null) {
    const existing = await db
      .select()
      .from(maintenanceParts)
      .where(eq(maintenanceParts.id, id));
    if (existing[0]) {
      const merged = { ...existing[0], ...data };
      data.valorTotal =
        merged.valorUnit != null && merged.qtde != null
          ? merged.valorUnit * merged.qtde
          : null;
    }
  }

  await db.update(maintenanceParts).set(data).where(eq(maintenanceParts.id, id));
}

export async function deleteMaintenancePart(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(maintenanceParts).where(eq(maintenanceParts.id, id));
}

// ============================================================================
// Reports - Machine
// ============================================================================

export async function getMachineReport(maquinaId: string, from: string, to: string) {
  const db = await getDb();
  if (!db) return null;

  // Buscar logs do período
  const logs = await db
    .select()
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.maquinaId, maquinaId),
        gte(dailyLogs.data, sql`${from}`),
        lte(dailyLogs.data, sql`${to}`)
      )
    );

  // Buscar manutenções do período
  const maintenances = await getMaintenanceByMachineAndPeriod(maquinaId, from, to);

  // Calcular totais
  const totalHorasMotor = logs.reduce((sum, log) => sum + (log.horasMotorDia || 0), 0);
  const totalHorasTrilha = logs.reduce((sum, log) => sum + (log.horasTrilhaDia || 0), 0);
  const totalProdH = logs.reduce((sum, log) => sum + (log.prodH || 0), 0);
  const totalManH = logs.reduce((sum, log) => sum + (log.manH || 0), 0);
  const totalChuvaH = logs.reduce((sum, log) => sum + (log.chuvaH || 0), 0);
  const totalDeslocH = logs.reduce((sum, log) => sum + (log.deslocH || 0), 0);
  const totalEsperaH = logs.reduce((sum, log) => sum + (log.esperaH || 0), 0);
  const totalAreaHa = logs.reduce((sum, log) => sum + (log.areaHa || 0), 0);
  const totalAbastecimentos = logs.filter((log) => log.abasteceu).length;

  // Contar manutenções por tipo
  const manutencoesPorTipo = {
    preventiva: maintenances.filter((m) => m.tipo === "preventiva").length,
    corretiva_leve: maintenances.filter((m) => m.tipo === "corretiva_leve").length,
    corretiva_pesada: maintenances.filter((m) => m.tipo === "corretiva_pesada").length,
  };

  const totalTrocasOleo = maintenances.filter((m) => m.trocaOleo).length;
  const totalRevisoes50h = maintenances.filter((m) => m.revisao50h).length;

  // Calcular custo total de peças
  let custoTotalPecas = 0;
  for (const maint of maintenances) {
    const parts = await getMaintenancePartsByMaintenanceId(maint.id);
    custoTotalPecas += parts.reduce((sum, part) => sum + (part.valorTotal || 0), 0);
  }

  // Buscar próximas manutenções
  const lastMaintenance = maintenances[0]; // Mais recente
  const machine = await getMachineById(maquinaId);

  return {
    maquinaId,
    periodo: { from, to },
    totalHorasMotor,
    totalHorasTrilha,
    distribuicaoHoras: {
      prod: totalProdH,
      man: totalManH,
      chuva: totalChuvaH,
      desloc: totalDeslocH,
      espera: totalEsperaH,
    },
    totalAreaHa,
    totalAbastecimentos,
    manutencoesPorTipo,
    totalTrocasOleo,
    totalRevisoes50h,
    custoTotalPecas,
    proximasManutencoes: {
      proximaTrocaOleoHm: lastMaintenance?.proximaTrocaOleoHm || null,
      proximaRevisao50hHm: lastMaintenance?.proximaRevisao50hHm || null,
    },
  };
}

// ============================================================================
// Reports - Operator
// ============================================================================

export async function getOperatorReport(from: string, to: string) {
  const db = await getDb();
  if (!db) return [];

  const logs = await getDailyLogsByPeriod(from, to);

  // Agrupar por operador
  const operatorMap = new Map<
    string,
    {
      operador: string;
      totalDias: number;
      totalHorasMotor: number;
      totalHorasProd: number;
      totalArea: number;
      totalDivergencias: number;
    }
  >();

  for (const log of logs) {
    const existing = operatorMap.get(log.operador) || {
      operador: log.operador,
      totalDias: 0,
      totalHorasMotor: 0,
      totalHorasProd: 0,
      totalArea: 0,
      totalDivergencias: 0,
    };

    existing.totalDias += 1;
    existing.totalHorasMotor += log.horasMotorDia || 0;
    existing.totalHorasProd += log.prodH || 0;
    existing.totalArea += log.areaHa || 0;
    if (log.divergente) {
      existing.totalDivergencias += 1;
    }

    operatorMap.set(log.operador, existing);
  }

  // Calcular métricas finais
  const operators = Array.from(operatorMap.values()).map((op) => ({
    operador: op.operador,
    totalDias: op.totalDias,
    totalHorasMotor: op.totalHorasMotor,
    totalHorasProd: op.totalHorasProd,
    totalArea: op.totalArea,
    produtividadeMedia: op.totalHorasProd > 0 ? op.totalArea / op.totalHorasProd : 0,
    taxaDivergencia: op.totalDias > 0 ? (op.totalDivergencias / op.totalDias) * 100 : 0,
  }));

  // Ordenar por produtividade (decrescente)
  operators.sort((a, b) => b.produtividadeMedia - a.produtividadeMedia);

  return operators;
}


/**
 * Relatório diário consolidado - resumo de todas as máquinas
 */
export async function getDailyReport(date: string) {
  const db = await getDb();
  if (!db) return null;

  const logs = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.data, date as any));

  const totalHorasMotor = logs.reduce((sum, log) => sum + (log.horasMotorDia || 0), 0);
  const totalHorasProd = logs.reduce((sum, log) => sum + (log.prodH || 0), 0);
  const totalHorasMan = logs.reduce((sum, log) => sum + (log.manH || 0), 0);
  const totalArea = logs.reduce((sum, log) => sum + (log.areaHa || 0), 0);
  const maquinasOperando = logs.length;
  const maquinasComDivergencia = logs.filter((log) => log.divergente).length;

  // Calcular métricas de tempo para cada log
  const logsComMetricas = logs.map((log) => {
    let tempoDeslocamentoMin = null;
    let tempoNaLavouraMin = null;
    let eficienciaPercent = null;

    // Tempo de deslocamento (Saída Real -> Chegada Lavoura)
    if (log.saidaReal && log.chegadaLavoura) {
      const [saidaH, saidaM] = log.saidaReal.split(":").map(Number);
      const [chegadaH, chegadaM] = log.chegadaLavoura.split(":").map(Number);
      if (!isNaN(saidaH) && !isNaN(saidaM) && !isNaN(chegadaH) && !isNaN(chegadaM)) {
        const saidaMinutos = saidaH * 60 + saidaM;
        const chegadaMinutos = chegadaH * 60 + chegadaM;
        tempoDeslocamentoMin = chegadaMinutos - saidaMinutos;
      }
    }

    // Tempo na lavoura (Chegada Lavoura -> Saída Lavoura)
    if (log.chegadaLavoura && log.saidaLavoura) {
      const [chegadaH, chegadaM] = log.chegadaLavoura.split(":").map(Number);
      const [saidaH, saidaM] = log.saidaLavoura.split(":").map(Number);
      if (!isNaN(chegadaH) && !isNaN(chegadaM) && !isNaN(saidaH) && !isNaN(saidaM)) {
        const chegadaMinutos = chegadaH * 60 + chegadaM;
        const saidaMinutos = saidaH * 60 + saidaM;
        tempoNaLavouraMin = saidaMinutos - chegadaMinutos;
      }
    }

    // Eficiência (Produção / Horas Motor Total)
    if (log.horasMotorDia && log.horasMotorDia > 0) {
      eficienciaPercent = ((log.prodH || 0) / log.horasMotorDia) * 100;
    }

    return {
      ...log,
      tempoDeslocamentoMin,
      tempoNaLavouraMin,
      eficienciaPercent,
    };
  });

  // Calcular eficiência média da frota
  const eficienciaMedia = totalHorasMotor > 0 ? (totalHorasProd / totalHorasMotor) * 100 : 0;

  return {
    date,
    maquinasOperando,
    maquinasComDivergencia,
    totalHorasMotor,
    totalHorasProd,
    totalHorasMan,
    totalArea,
    produtividadeMedia: totalArea > 0 ? totalHorasProd / totalArea : 0,
    eficienciaMedia,
    logs: logsComMetricas,
  };
}

/**
 * Relatório de manutenções - custos e peças
 */
export async function getMaintenanceReportDetailed(dateFrom: string, dateTo: string) {
  const db = await getDb();
  if (!db) return null;

  const maintenanceRecords = await db
    .select()
    .from(maintenance)
    .where(
      and(
        sql`${maintenance.data} >= ${dateFrom}`,
        sql`${maintenance.data} <= ${dateTo}`
      )
    )
    .orderBy(maintenance.data);

  // Buscar peças de todas as manutenções
  const maintenanceIds = maintenanceRecords.map((m) => m.id);
  let parts: any[] = [];
  
  if (maintenanceIds.length > 0) {
    parts = await db
      .select()
      .from(maintenanceParts)
      .where(sql`${maintenanceParts.maintenanceId} IN (${sql.join(maintenanceIds.map(id => sql`${id}`), sql`, `)})`);
  }

  // Calcular custos totais
  const totalCustoPecas = parts.reduce((sum, part) => {
    return sum + (part.qtde || 0) * (part.valorUnit || 0);
  }, 0);

  const totalTempoParado = maintenanceRecords.reduce((sum, m) => sum + (m.tempoParadoH || 0), 0);

  // Agrupar por tipo de manutenção
  const byType = {
    preventiva: maintenanceRecords.filter((m) => m.tipo === "preventiva").length,
    corretiva_leve: maintenanceRecords.filter((m) => m.tipo === "corretiva_leve").length,
    corretiva_pesada: maintenanceRecords.filter((m) => m.tipo === "corretiva_pesada").length,
  };

  // Agrupar por máquina
  const byMachine = new Map<string, any>();
  maintenanceRecords.forEach((m) => {
    if (!byMachine.has(m.maquinaId)) {
      byMachine.set(m.maquinaId, {
        maquinaId: m.maquinaId,
        totalManutencoes: 0,
        tempoParado: 0,
      });
    }
    const data = byMachine.get(m.maquinaId)!;
    data.totalManutencoes++;
    data.tempoParado += m.tempoParadoH || 0;
  });

  return {
    periodo: { from: dateFrom, to: dateTo },
    totalManutencoes: maintenanceRecords.length,
    totalCustoPecas,
    totalTempoParado,
    byType,
    byMachine: Array.from(byMachine.values()),
    maintenanceRecords,
    parts,
  };
}

/**
 * Exportar dados para CSV
 */
export function exportToCSV(data: any[], filename: string): string {
  if (data.length === 0) return "";

  // Extrair headers
  const headers = Object.keys(data[0]);
  
  // Criar linhas CSV
  const csvRows = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escapar vírgulas e aspas
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      }).join(",")
    ),
  ];

  return csvRows.join("\n");
}

// ============================================================================
// App Settings Functions
// ============================================================================

/**
 * Buscar configurações do aplicativo
 */
export async function getSettings() {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  const settings = await dbInstance.select().from(appSettings).limit(1);
  
  if (settings.length === 0) {
    // Criar configurações padrão se não existir
    const defaultSettings = {
      emailDestinatario: null,
      envioEmailAtivo: false,
      horarioEnvioEmail: "18:00",
      whatsappNumero: null,
      envioWhatsappAtivo: false,
      horarioEnvioWhatsapp: "18:00",
      twilioAccountSid: null,
      twilioAuthToken: null,
      twilioWhatsappFrom: null,
    };
    
    await dbInstance.insert(appSettings).values(defaultSettings);
    return defaultSettings;
  }
  
  return settings[0];
}

/**
 * Atualizar configurações do aplicativo
 */
export async function updateSettings(data: Partial<InsertAppSettings>) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  const existing = await dbInstance.select().from(appSettings).limit(1);
  
  if (existing.length === 0) {
    // Criar se não existir
    await dbInstance.insert(appSettings).values(data);
  } else {
    // Atualizar existente
    await dbInstance.update(appSettings).set(data).where(eq(appSettings.id, existing[0].id));
  }
}

// ============================================================================
// Fazendas Functions
// ============================================================================

export async function getAllFazendas() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  return dbInstance.select().from(fazendas).where(eq(fazendas.ativo, true)).orderBy(fazendas.nome);
}

export async function getFazendaById(id: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;
  const result = await dbInstance.select().from(fazendas).where(eq(fazendas.id, id)).limit(1);
  return result[0] || null;
}

export async function createFazenda(data: InsertFazenda) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  const result = await dbInstance.insert(fazendas).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateFazenda(id: number, data: Partial<InsertFazenda>) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  await dbInstance.update(fazendas).set(data).where(eq(fazendas.id, id));
  return { success: true };
}

export async function deleteFazenda(id: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  // Soft delete
  await dbInstance.update(fazendas).set({ ativo: false }).where(eq(fazendas.id, id));
  return { success: true };
}

// ============================================================================
// Talhões Functions
// ============================================================================

export async function getAllTalhoes() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  return dbInstance.select().from(talhoes).where(eq(talhoes.ativo, true)).orderBy(talhoes.nome);
}

export async function getTalhoesByFazenda(fazendaId: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  return dbInstance
    .select()
    .from(talhoes)
    .where(sql`${talhoes.fazendaId} = ${fazendaId} AND ${talhoes.ativo} = true`)
    .orderBy(talhoes.nome);
}

export async function createTalhao(data: InsertTalhao) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  const result = await dbInstance.insert(talhoes).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateTalhao(id: number, data: Partial<InsertTalhao>) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  await dbInstance.update(talhoes).set(data).where(eq(talhoes.id, id));
  return { success: true };
}

export async function deleteTalhao(id: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  // Soft delete
  await dbInstance.update(talhoes).set({ ativo: false }).where(eq(talhoes.id, id));
  return { success: true };
}

// ============================================================================
// Operadores Functions
// ============================================================================

export async function getAllOperadores() {
  const dbInstance = await getDb();
  if (!dbInstance) return [];
  return dbInstance.select().from(operadores).where(eq(operadores.ativo, true)).orderBy(operadores.nome);
}

export async function getOperadorById(id: number) {
  const dbInstance = await getDb();
  if (!dbInstance) return null;
  const result = await dbInstance.select().from(operadores).where(eq(operadores.id, id)).limit(1);
  return result[0] || null;
}

export async function createOperador(data: InsertOperador) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  const result = await dbInstance.insert(operadores).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateOperador(id: number, data: Partial<InsertOperador>) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  await dbInstance.update(operadores).set(data).where(eq(operadores.id, id));
  return { success: true };
}

export async function deleteOperador(id: number) {
  const dbInstance = await getDb();
  if (!dbInstance) throw new Error("Database not available");
  // Soft delete
  await dbInstance.update(operadores).set({ ativo: false }).where(eq(operadores.id, id));
  return { success: true };
}
