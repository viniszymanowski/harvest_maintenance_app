import * as db from "../server/db";

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Aguardar inicialização das máquinas
  await db.initializeMachines();
  console.log("✅ Máquinas inicializadas");

  // Criar alguns lançamentos de exemplo
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Lançamentos de ontem
  const log1 = await db.createDailyLog({
    id: crypto.randomUUID(),
    data: yesterdayStr,
    fazenda: "Fazenda São João",
    talhao: "T-01",
    maquinaId: "M1",
    operador: "João Silva",
    saidaProgramada: "08:00",
    saidaReal: "08:15",
    chegadaLavoura: "09:00",
    hmMotorInicial: 1200.5,
    hmMotorFinal: 1210.8,
    hmTrilhaInicial: 800.2,
    hmTrilhaFinal: 808.5,
    prodH: 8.0,
    manH: 1.5,
    chuvaH: 0.5,
    deslocH: 0.3,
    esperaH: 0.0,
    abasteceu: true,
    areaHa: 12.5,
    observacoes: "Dia produtivo, sem problemas",
  } as any);
  console.log("✅ Lançamento M1 (ontem) criado");

  const log2 = await db.createDailyLog({
    id: crypto.randomUUID(),
    data: yesterdayStr,
    fazenda: "Fazenda Santa Maria",
    talhao: "T-03",
    maquinaId: "M2",
    operador: "Pedro Santos",
    saidaProgramada: "08:00",
    saidaReal: "08:05",
    chegadaLavoura: "08:45",
    hmMotorInicial: 950.0,
    hmMotorFinal: 959.5,
    hmTrilhaInicial: 620.0,
    hmTrilhaFinal: 628.2,
    prodH: 7.5,
    manH: 1.0,
    chuvaH: 1.0,
    deslocH: 0.0,
    esperaH: 0.0,
    abasteceu: false,
    areaHa: 10.2,
    observacoes: "Chuva no período da tarde",
  } as any);
  console.log("✅ Lançamento M2 (ontem) criado");

  // Lançamentos de hoje
  const log3 = await db.createDailyLog({
    id: crypto.randomUUID(),
    data: todayStr,
    fazenda: "Fazenda São João",
    talhao: "T-02",
    maquinaId: "M1",
    operador: "João Silva",
    saidaProgramada: "08:00",
    saidaReal: "08:10",
    chegadaLavoura: "08:50",
    hmMotorInicial: 1210.8,
    hmMotorFinal: 1220.5,
    hmTrilhaInicial: 808.5,
    hmTrilhaFinal: 817.0,
    prodH: 8.5,
    manH: 0.5,
    chuvaH: 0.0,
    deslocH: 0.5,
    esperaH: 0.2,
    abasteceu: true,
    areaHa: 13.8,
    observacoes: "Excelente produtividade",
  } as any);
  console.log("✅ Lançamento M1 (hoje) criado");

  const log4 = await db.createDailyLog({
    id: crypto.randomUUID(),
    data: todayStr,
    fazenda: "Fazenda Boa Vista",
    talhao: "T-05",
    maquinaId: "M3",
    operador: "Carlos Oliveira",
    saidaProgramada: "07:30",
    saidaReal: "07:35",
    chegadaLavoura: "08:15",
    hmMotorInicial: 1500.0,
    hmMotorFinal: 1509.0,
    hmTrilhaInicial: 1000.0,
    hmTrilhaFinal: 1007.5,
    prodH: 7.0,
    manH: 1.5,
    chuvaH: 0.0,
    deslocH: 0.5,
    esperaH: 0.0,
    abasteceu: false,
    areaHa: 11.5,
    observacoes: "Pequena manutenção preventiva",
  } as any);
  console.log("✅ Lançamento M3 (hoje) criado");

  // Criar algumas manutenções de exemplo
  const maint1 = await db.createMaintenance({
    id: crypto.randomUUID(),
    data: yesterdayStr,
    maquinaId: "M1",
    tipo: "preventiva",
    hmMotorNoServico: 1200.0,
    tempoParadoH: 2.0,
    trocaOleo: true,
    revisao50h: false,
    observacao: "Troca de óleo preventiva",
  } as any);
  console.log("✅ Manutenção M1 criada");

  // Criar peças para a manutenção
  await db.createMaintenancePart({
    id: crypto.randomUUID(),
    maintenanceId: maint1.id,
    nomePeca: "Óleo Motor 15W40",
    qtde: 25,
    valorUnit: 18.5,
  });
  await db.createMaintenancePart({
    id: crypto.randomUUID(),
    maintenanceId: maint1.id,
    nomePeca: "Filtro de Óleo",
    qtde: 2,
    valorUnit: 45.0,
  });
  console.log("✅ Peças da manutenção M1 criadas");

  const maint2 = await db.createMaintenance({
    id: crypto.randomUUID(),
    data: todayStr,
    maquinaId: "M3",
    tipo: "corretiva_leve",
    hmMotorNoServico: 1500.0,
    tempoParadoH: 1.5,
    trocaOleo: false,
    revisao50h: false,
    observacao: "Ajuste de correias",
  } as any);
  console.log("✅ Manutenção M3 criada");

  await db.createMaintenancePart({
    id: crypto.randomUUID(),
    maintenanceId: maint2.id,
    nomePeca: "Correia Ventilador",
    qtde: 1,
    valorUnit: 85.0,
  });
  console.log("✅ Peças da manutenção M3 criadas");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("📊 Dados criados:");
  console.log("  - 4 lançamentos diários (2 ontem, 2 hoje)");
  console.log("  - 2 manutenções (M1 e M3)");
  console.log("  - 3 peças de manutenção");
}

seed()
  .then(() => {
    console.log("\n✅ Processo de seed finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro no seed:", error);
    process.exit(1);
  });
