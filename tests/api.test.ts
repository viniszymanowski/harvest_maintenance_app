import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Database Operations", () => {
  beforeAll(async () => {
    // Inicializar máquinas
    await db.initializeMachines();
  });

  describe("Machines", () => {
    it("should initialize 4 machines", async () => {
      const machines = await db.getAllMachines();
      expect(machines).toHaveLength(4);
      expect(machines.map((m) => m.id)).toEqual(["M1", "M2", "M3", "M4"]);
    });

    it("should get machine by id", async () => {
      const machine = await db.getMachineById("M1");
      expect(machine).toBeDefined();
      expect(machine?.id).toBe("M1");
      expect(machine?.intervaloTrocaOleoHm).toBe(250);
      expect(machine?.intervaloRevisao50hHm).toBe(50);
    });

    it("should update machine config", async () => {
      await db.updateMachine("M1", {
        intervaloTrocaOleoHm: 300,
        intervaloRevisao50hHm: 60,
      });
      const machine = await db.getMachineById("M1");
      expect(machine?.intervaloTrocaOleoHm).toBe(300);
      expect(machine?.intervaloRevisao50hHm).toBe(60);
    });
  });

  describe("Daily Logs", () => {
    it("should create daily log with calculated fields", async () => {
      const log = await db.createDailyLog({
        id: crypto.randomUUID(),
        data: "2026-02-08",
        fazenda: "Test Farm",
        talhao: "T-01",
        maquinaId: "M1",
        operador: "Test Operator",
        saidaProgramada: "08:00",
        saidaReal: "08:15",
        chegadaLavoura: "09:00",
        hmMotorInicial: 100.0,
        hmMotorFinal: 110.0,
        hmTrilhaInicial: 50.0,
        hmTrilhaFinal: 58.0,
        prodH: 8.0,
        manH: 1.5,
        chuvaH: 0.5,
        deslocH: 0.0,
        esperaH: 0.0,
        abasteceu: true,
        areaHa: 12.5,
      } as any);

      expect(log.horasMotorDia).toBe(10.0);
      expect(log.horasTrilhaDia).toBe(8.0);
      expect(log.atrasoMin).toBe(15);
      expect(log.divergente).toBe(false); // 8+1.5+0.5 = 10, diferença = 0
    });

    it("should detect divergence", async () => {
      const log = await db.createDailyLog({
        id: crypto.randomUUID(),
        data: "2026-02-08",
        fazenda: "Test Farm",
        talhao: "T-02",
        maquinaId: "M2",
        operador: "Test Operator",
        hmMotorInicial: 100.0,
        hmMotorFinal: 110.0,
        prodH: 5.0, // Soma = 5, diferença com 10h = 5 > 0.5
        manH: 0.0,
        chuvaH: 0.0,
        deslocH: 0.0,
        esperaH: 0.0,
        abasteceu: false,
      } as any);

      expect(log.horasMotorDia).toBe(10.0);
      expect(log.divergente).toBe(true);
    });

    it("should get daily logs by date", async () => {
      const logs = await db.getDailyLogsByDate("2026-02-08");
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("Maintenance", () => {
    it("should create maintenance record", async () => {
      const maint = await db.createMaintenance({
        id: crypto.randomUUID(),
        data: "2026-02-08",
        maquinaId: "M1",
        tipo: "preventiva",
        hmMotorNoServico: 300.0,
        tempoParadoH: 2.0,
        trocaOleo: true,
        revisao50h: false,
        observacao: "Test maintenance",
      } as any);

      expect(maint.id).toBeDefined();
      expect(maint.maquinaId).toBe("M1");
      expect(maint.tipo).toBe("preventiva");
    });

    it("should create maintenance parts", async () => {
      const maint = await db.createMaintenance({
        id: crypto.randomUUID(),
        data: "2026-02-08",
        maquinaId: "M2",
        tipo: "corretiva_leve",
        hmMotorNoServico: 200.0,
        tempoParadoH: 1.5,
        trocaOleo: false,
        revisao50h: false,
      } as any);

      const part = await db.createMaintenancePart({
        id: crypto.randomUUID(),
        maintenanceId: maint.id,
        nomePeca: "Test Part",
        qtde: 2,
        valorUnit: 50.0,
      });

      expect(part.id).toBeDefined();
      expect(part.maintenanceId).toBe(maint.id);

      const parts = await db.getMaintenancePartsByMaintenanceId(maint.id);
      expect(parts).toHaveLength(1);
      expect(parts[0].nomePeca).toBe("Test Part");
    });
  });

  describe("Reports", () => {
    it("should generate machine report", async () => {
      const report = await db.getMachineReport("M1", "2026-02-01", "2026-02-28");
      expect(report).toBeDefined();
      expect(report?.maquinaId).toBe("M1");
      expect(report?.totalHorasMotor).toBeGreaterThanOrEqual(0);
      expect(report?.totalHorasTrilha).toBeGreaterThanOrEqual(0);
    });

    it("should generate operator report", async () => {
      const report = await db.getOperatorReport("2026-02-01", "2026-02-28");
      expect(Array.isArray(report)).toBe(true);
    });
  });
});
