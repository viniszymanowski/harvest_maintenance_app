import { describe, it, expect, beforeEach } from "vitest";
import * as db from "../server/db";
import { getDb } from "../server/db";
import { machines, dailyLogs, maintenance } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Função auxiliar para limpar dados de teste
async function cleanupTestData() {
  const database = await getDb();
  if (!database) return;
  
  // Deletar dados de teste
  await database.delete(dailyLogs).where(eq(dailyLogs.maquinaId, "TEST1"));
  await database.delete(dailyLogs).where(eq(dailyLogs.maquinaId, "TEST2"));
  await database.delete(dailyLogs).where(eq(dailyLogs.maquinaId, "TEST3"));
  await database.delete(maintenance).where(eq(maintenance.maquinaId, "TEST1"));
  await database.delete(maintenance).where(eq(maintenance.maquinaId, "TEST2"));
  await database.delete(maintenance).where(eq(maintenance.maquinaId, "TEST3"));
  await database.delete(machines).where(eq(machines.id, "TEST1"));
  await database.delete(machines).where(eq(machines.id, "TEST2"));
  await database.delete(machines).where(eq(machines.id, "TEST3"));
}

describe("Sistema Integrado - Fluxo Completo", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });
  it("Deve calcular próxima manutenção corretamente após lançamento", async () => {
    // 1. Criar máquina de teste
    const machineId = "TEST1";
    await db.createMachine({
      id: machineId,
      nome: "Máquina de Teste",
      intervaloTrocaOleoHm: 250,
      intervaloRevisao50hHm: 50,
    });

    // 2. Criar lançamento com horímetro
    const dailyLogId = crypto.randomUUID();
    await db.createDailyLog({
      id: dailyLogId,
      data: new Date().toISOString().split("T")[0] as any,
      fazenda: "Fazenda Teste",
      talhao: "Talhão 1",
      maquinaId: machineId,
      operador: "Operador Teste",
      hmMotorInicial: 100,
      hmMotorFinal: 110,
      prodH: 8,
      manH: 0,
      chuvaH: 0,
      deslocH: 1,
      esperaH: 1,
      abasteceu: true,
    });

    // 3. Criar manutenção com troca de óleo
    const maintenanceId = crypto.randomUUID();
    await db.createMaintenance({
      id: maintenanceId,
      data: new Date().toISOString().split("T")[0] as any,
      maquinaId: machineId,
      tipo: "preventiva",
      hmMotorNoServico: 110,
      tempoParadoH: 2,
      trocaOleo: true,
      revisao50h: false,
    });

    // 4. Verificar se próxima manutenção foi calculada corretamente
    const maintenance = await db.getMaintenanceById(maintenanceId);
    expect(maintenance?.proximaTrocaOleoHm).toBe(360); // 110 + 250

    // 5. Criar novo lançamento que ultrapassa a próxima manutenção
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dailyLog2Id = crypto.randomUUID();
    await db.createDailyLog({
      id: dailyLog2Id,
      data: tomorrow.toISOString().split("T")[0] as any,
      fazenda: "Fazenda Teste",
      talhao: "Talhão 1",
      maquinaId: machineId,
      operador: "Operador Teste",
      hmMotorInicial: 350,
      hmMotorFinal: 370,
      prodH: 8,
      manH: 0,
      chuvaH: 0,
      deslocH: 1,
      esperaH: 1,
      abasteceu: true,
    });

    // 6. Verificar status de manutenção
    const currentHm = await db.getCurrentHorimeter(machineId);
    expect(currentHm).toBe(370);

    const latestMaintenance = await db.getLatestMaintenanceByMachine(machineId);
    expect(latestMaintenance?.proximaTrocaOleoHm).toBe(360);

    // Horímetro atual (370) > próxima troca (360) = precisa de manutenção
    const needsMaintenance = currentHm! >= latestMaintenance!.proximaTrocaOleoHm!;
    expect(needsMaintenance).toBe(true);
  });

  it("Deve atualizar intervalos de manutenção corretamente", async () => {
    const machineId = "TEST2";
    
    // Criar máquina
    await db.createMachine({
      id: machineId,
      nome: "Máquina Teste 2",
      intervaloTrocaOleoHm: 250,
      intervaloRevisao50hHm: 50,
    });

    // Atualizar intervalos
    await db.updateMachine(machineId, {
      intervaloTrocaOleoHm: 300,
      intervaloRevisao50hHm: 60,
    });

    // Verificar se foi atualizado
    const machine = await db.getMachineById(machineId);
    expect(machine?.intervaloTrocaOleoHm).toBe(300);
    expect(machine?.intervaloRevisao50hHm).toBe(60);

    // Criar manutenção com novos intervalos
    const maintenanceId = crypto.randomUUID();
    await db.createMaintenance({
      id: maintenanceId,
      data: new Date().toISOString().split("T")[0] as any,
      maquinaId: machineId,
      tipo: "preventiva",
      hmMotorNoServico: 100,
      tempoParadoH: 2,
      trocaOleo: true,
      revisao50h: true,
    });

    // Verificar se próximas manutenções usam novos intervalos
    const maintenance = await db.getMaintenanceById(maintenanceId);
    expect(maintenance?.proximaTrocaOleoHm).toBe(400); // 100 + 300
    expect(maintenance?.proximaRevisao50hHm).toBe(160); // 100 + 60
  });

  it("Deve calcular horas motor dia corretamente", async () => {
    const machineId = "TEST3";
    
    await db.createMachine({
      id: machineId,
      nome: "Máquina Teste 3",
      intervaloTrocaOleoHm: 250,
      intervaloRevisao50hHm: 50,
    });

    const dailyLogId = crypto.randomUUID();
    await db.createDailyLog({
      id: dailyLogId,
      data: new Date().toISOString().split("T")[0] as any,
      fazenda: "Fazenda Teste",
      talhao: "Talhão 1",
      maquinaId: machineId,
      operador: "Operador Teste",
      hmMotorInicial: 100,
      hmMotorFinal: 110,
      prodH: 8,
      manH: 1,
      chuvaH: 0,
      deslocH: 0.5,
      esperaH: 0.5,
      abasteceu: true,
    });

    const log = await db.getDailyLogById(dailyLogId);
    
    // Horas motor dia = hmMotorFinal - hmMotorInicial = 110 - 100 = 10
    expect(log?.horasMotorDia).toBe(10);
    
    // Total horas = prod + man + chuva + desloc + espera = 8 + 1 + 0 + 0.5 + 0.5 = 10
    const totalHoras = (log?.prodH || 0) + (log?.manH || 0) + (log?.chuvaH || 0) + 
                       (log?.deslocH || 0) + (log?.esperaH || 0);
    expect(totalHoras).toBe(10);
    
    // Divergente = |horasMotorDia - totalHoras| > 0.5
    const divergencia = Math.abs((log?.horasMotorDia || 0) - totalHoras);
    expect(log?.divergente).toBe(divergencia > 0.5);
  });
});
