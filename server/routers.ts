import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Inicializar máquinas ao iniciar o servidor
db.initializeMachines().catch((err) => console.error("Failed to initialize machines:", err));

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // Machines
  // ============================================================================
  machines: router({
    list: publicProcedure.query(async () => {
      return db.getAllMachines();
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return db.getMachineById(input.id);
    }),

    updateConfig: publicProcedure
      .input(
        z.object({
          id: z.string(),
          config: z.object({
            intervaloTrocaOleoHm: z.number().positive(),
            intervaloRevisao50hHm: z.number().positive(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateMachine(input.id, input.config);
        return { success: true };
      }),

    updateName: publicProcedure
      .input(
        z.object({
          id: z.string(),
          nome: z.string().min(1),
          tipo: z.enum(["Colheitadeira", "Plataforma", "Trator", "Pulverizador"]).optional(),
          modelo: z.string().optional(),
          chassi: z.string().optional(),
          ano: z.number().optional(),
          fabricante: z.string().optional(),
          intervaloTrocaOleoHm: z.number().optional(),
          intervaloRevisao50hHm: z.number().optional(),
          hmMotorAtual: z.number().optional(),
          hmTrilhaAtual: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        await db.updateMachine(id, updateData);
        return { success: true };
      }),

    create: publicProcedure
      .input(
        z.object({
          id: z.string().min(1).max(10),
          nome: z.string().min(1),
          tipo: z.enum(["Colheitadeira", "Plataforma", "Trator", "Pulverizador"]).default("Colheitadeira"),
          modelo: z.string().optional(),
          chassi: z.string().optional(),
          ano: z.number().optional(),
          fabricante: z.string().optional(),
          intervaloTrocaOleoHm: z.number().positive().default(250),
          intervaloRevisao50hHm: z.number().positive().default(50),
          hmMotorAtual: z.number().default(0),
          hmTrilhaAtual: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        return db.createMachine(input as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteMachine(input.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // Daily Logs
  // ============================================================================
  dailyLogs: router({
    create: publicProcedure
      .input(
        z.object({
          data: z.string(),
          fazenda: z.string().min(1),
          talhao: z.string().min(1),
          maquinaId: z.enum(["M1", "M2", "M3", "M4"]),
          operador: z.string().min(1),
          saidaProgramada: z.string().optional(),
          saidaReal: z.string().optional(),
          chegadaLavoura: z.string().optional(),
          saidaLavoura: z.string().optional(),
          hmMotorInicial: z.number().optional(),
          hmMotorFinal: z.number().optional(),
          hmTrilhaInicial: z.number().optional(),
          hmTrilhaFinal: z.number().optional(),
          prodH: z.number().default(0),
          manH: z.number().default(0),
          chuvaH: z.number().default(0),
          deslocH: z.number().default(0),
          esperaH: z.number().default(0),
          abasteceu: z.boolean().default(false),
          areaHa: z.number().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = crypto.randomUUID();
        return db.createDailyLog({ id, ...input } as any);
      }),

    getByDate: publicProcedure.input(z.object({ date: z.string() })).query(async ({ input }) => {
      return db.getDailyLogsByDate(input.date);
    }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return db.getDailyLogById(input.id);
    }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          data: z
            .object({
              data: z.string().optional(),
              fazenda: z.string().optional(),
              talhao: z.string().optional(),
              maquinaId: z.enum(["M1", "M2", "M3", "M4"]).optional(),
              operador: z.string().optional(),
              saidaProgramada: z.string().optional(),
              saidaReal: z.string().optional(),
              chegadaLavoura: z.string().optional(),
          saidaLavoura: z.string().optional(),
              hmMotorInicial: z.number().optional(),
              hmMotorFinal: z.number().optional(),
              hmTrilhaInicial: z.number().optional(),
              hmTrilhaFinal: z.number().optional(),
              prodH: z.number().optional(),
              manH: z.number().optional(),
              chuvaH: z.number().optional(),
              deslocH: z.number().optional(),
              esperaH: z.number().optional(),
              abasteceu: z.boolean().optional(),
              areaHa: z.number().optional(),
              observacoes: z.string().optional(),
            })
            .partial(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateDailyLog(input.id, input.data as any);
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await db.deleteDailyLog(input.id);
      return { success: true };
    }),

    getByPeriod: publicProcedure
      .input(z.object({ from: z.string(), to: z.string() }))
      .query(async ({ input }) => {
        return db.getDailyLogsByPeriod(input.from, input.to);
      }),
  }),

  // ============================================================================
  // Maintenance
  // ============================================================================
  maintenance: router({
    list: publicProcedure.query(async () => {
      return db.getAllMaintenance();
    }),

    getMaintenanceStatus: publicProcedure
      .input(z.object({ maquinaId: z.string() }))
      .query(async ({ input }) => {
        const latestMaintenance = await db.getLatestMaintenanceByMachine(input.maquinaId);
        const currentHm = await db.getCurrentHorimeter(input.maquinaId);
        
        if (!latestMaintenance || !currentHm) {
          return {
            needsOilChange: false,
            needs50hRevision: false,
            currentHm,
            nextOilChangeHm: latestMaintenance?.proximaTrocaOleoHm || null,
            next50hRevisionHm: latestMaintenance?.proximaRevisao50hHm || null,
          };
        }
        
        const needsOilChange = latestMaintenance.proximaTrocaOleoHm 
          ? currentHm >= latestMaintenance.proximaTrocaOleoHm 
          : false;
        
        const needs50hRevision = latestMaintenance.proximaRevisao50hHm
          ? currentHm >= latestMaintenance.proximaRevisao50hHm
          : false;
        
        return {
          needsOilChange,
          needs50hRevision,
          currentHm,
          nextOilChangeHm: latestMaintenance.proximaTrocaOleoHm || null,
          next50hRevisionHm: latestMaintenance.proximaRevisao50hHm || null,
        };
      }),

    create: publicProcedure
      .input(
        z.object({
          data: z.string(),
          maquinaId: z.string(),
          tipo: z.enum(["preventiva", "corretiva_leve", "corretiva_pesada"]),
          hmMotorNoServico: z.number(),
          tempoParadoH: z.number(),
          trocaOleo: z.boolean().default(false),
          revisao50h: z.boolean().default(false),
          observacao: z.string().optional(),
          parts: z.array(z.object({
            nomePeca: z.string(),
            qtde: z.number(),
            valorUnit: z.number(),
          })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = crypto.randomUUID();
        const { parts, ...maintenanceData } = input;
        const maintenance = await db.createMaintenance({ id, ...maintenanceData } as any);
        
        // Create parts if provided
        if (parts && parts.length > 0) {
          for (const part of parts) {
            await db.createMaintenancePart({
              id: crypto.randomUUID(),
              maintenanceId: id,
              ...part,
            });
          }
        }
        
        return maintenance;
      }),

    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return db.getMaintenanceById(input.id);
    }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          updateData: z
            .object({
              data: z.string().optional(),
              maquinaId: z.enum(["M1", "M2", "M3", "M4"]).optional(),
              tipo: z.enum(["preventiva", "corretiva_leve", "corretiva_pesada"]).optional(),
              hmMotorNoServico: z.number().optional(),
              tempoParadoH: z.number().optional(),
              trocaOleo: z.boolean().optional(),
              revisao50h: z.boolean().optional(),
              observacao: z.string().optional(),
            })
            .partial(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateMaintenance(input.id, input.updateData as any);
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await db.deleteMaintenance(input.id);
      return { success: true };
    }),

    getByMachineAndPeriod: publicProcedure
      .input(z.object({ maquinaId: z.string(), from: z.string(), to: z.string() }))
      .query(async ({ input }) => {
        return db.getMaintenanceByMachineAndPeriod(input.maquinaId, input.from, input.to);
      }),

    getByPeriod: publicProcedure
      .input(z.object({ from: z.string(), to: z.string() }))
      .query(async ({ input }) => {
        return db.getAllMaintenanceByPeriod(input.from, input.to);
      }),
  }),

  // ============================================================================
  // Maintenance Parts
  // ============================================================================
  maintenanceParts: router({
    create: publicProcedure
      .input(
        z.object({
          maintenanceId: z.string().uuid(),
          nomePeca: z.string().min(1),
          qtde: z.number(),
          valorUnit: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = crypto.randomUUID();
        return db.createMaintenancePart({ id, ...input });
      }),

    getByMaintenanceId: publicProcedure
      .input(z.object({ maintenanceId: z.string() }))
      .query(async ({ input }) => {
        return db.getMaintenancePartsByMaintenanceId(input.maintenanceId);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          data: z
            .object({
              nomePeca: z.string().optional(),
              qtde: z.number().optional(),
              valorUnit: z.number().optional(),
            })
            .partial(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateMaintenancePart(input.id, input.data);
        return { success: true };
      }),

    delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      await db.deleteMaintenancePart(input.id);
      return { success: true };
    }),
  }),

  // ============================================================================
  // Reports
  // ============================================================================
  reports: router({
    daily: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        return db.getDailyReport(input.date);
      }),

    machine: publicProcedure
      .input(z.object({ maquinaId: z.string(), from: z.string(), to: z.string() }))
      .query(async ({ input }) => {
        return db.getMachineReport(input.maquinaId, input.from, input.to);
      }),

    operators: publicProcedure
      .input(z.object({ from: z.string(), to: z.string() }))
      .query(async ({ input }) => {
        return db.getOperatorReport(input.from, input.to);
      }),

    maintenance: publicProcedure
      .input(z.object({ from: z.string(), to: z.string() }))
      .query(async ({ input }) => {
        return db.getMaintenanceReportDetailed(input.from, input.to);
      }),

    exportCSV: publicProcedure
      .input(z.object({ data: z.array(z.any()), filename: z.string() }))
      .mutation(async ({ input }) => {
        const csv = db.exportToCSV(input.data, input.filename);
        return { csv, filename: input.filename };
      }),

    generatePDF: publicProcedure
      .input(z.object({ type: z.enum(["daily", "operators", "maintenance"]), date: z.string().optional(), from: z.string().optional(), to: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { generateReportPDF } = await import("./pdf");
        return generateReportPDF(input.type, { date: input.date, from: input.from, to: input.to });
      }),
  }),

  // ============================================================================
  // Settings
  // ============================================================================
  settings: router({
    get: publicProcedure.query(async () => {
      return db.getSettings();
    }),

    update: publicProcedure
      .input(
        z.object({
          emailDestinatario: z.string().optional(),
          envioEmailAtivo: z.boolean().optional(),
          horarioEnvioEmail: z.string().optional(),
          whatsappNumero: z.string().optional(),
          envioWhatsappAtivo: z.boolean().optional(),
          horarioEnvioWhatsapp: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateSettings(input);
        return { success: true };
      }),

    sendTestEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { sendTestReport } = await import("./email");
        return sendTestReport(input.email);
      }),

    sendTestWhatsApp: publicProcedure
      .input(z.object({ phoneNumber: z.string() }))
      .mutation(async ({ input }) => {
        const { sendTestReportWhatsApp } = await import("./whatsapp");
        return sendTestReportWhatsApp(input.phoneNumber);
      }),
  }),

  // ============================================================================
  // Fazendas
  // ============================================================================
  fazendas: router({
    list: publicProcedure.query(async () => {
      return db.getAllFazendas();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getFazendaById(input.id);
    }),

    create: publicProcedure
      .input(
        z.object({
          nome: z.string(),
          localizacao: z.string().nullable().optional(),
          areaTotal: z.number().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createFazenda(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string().transform(Number),
          nome: z.string(),
          localizacao: z.string().nullable().optional(),
          areaTotal: z.number().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateFazenda(id, data);
      }),

    delete: publicProcedure.input(z.object({ id: z.string().transform(Number) })).mutation(async ({ input }) => {
      return db.deleteFazenda(input.id);
    }),
  }),

  // ============================================================================
  // Talhões
  // ============================================================================
  talhoes: router({
    list: publicProcedure.query(async () => {
      return db.getAllTalhoes();
    }),

    getByFazenda: publicProcedure
      .input(z.object({ fazendaId: z.number() }))
      .query(async ({ input }) => {
        return db.getTalhoesByFazenda(input.fazendaId);
      }),

    create: publicProcedure
      .input(
        z.object({
          fazendaId: z.string().transform((val) => parseInt(val)),
          nome: z.string(),
          areaHa: z.number().nullable().optional(),
          cultura: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createTalhao(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string().transform((val) => parseInt(val)),
          fazendaId: z.string().transform((val) => parseInt(val)),
          nome: z.string(),
          areaHa: z.number().nullable().optional(),
          cultura: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTalhao(id, data);
      }),

    delete: publicProcedure.input(z.object({ id: z.string().transform((val) => parseInt(val)) })).mutation(async ({ input }) => {
      return db.deleteTalhao(input.id);
    }),
  }),

  // ============================================================================
  // Operadores
  // ============================================================================
  operadores: router({
    list: publicProcedure.query(async () => {
      return db.getAllOperadores();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getOperadorById(input.id);
    }),

    create: publicProcedure
      .input(
        z.object({
          nome: z.string(),
          cpf: z.string().nullable().optional(),
          telefone: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createOperador(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string().transform(Number),
          nome: z.string(),
          cpf: z.string().nullable().optional(),
          telefone: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateOperador(id, data);
      }),

    delete: publicProcedure.input(z.object({ id: z.string().transform(Number) })).mutation(async ({ input }) => {
      return db.deleteOperador(input.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
