import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface DailyReportData {
  date: string;
  machines: Array<{
    maquinaId: string;
    nome?: string | null;
    operador?: string | null;
    chegadaLavoura?: string | null;
    saidaLavoura?: string | null;
    horasMotorDia: number;
    areaHa: number;
    prodH: number;
  }>;
  totals: {
    totalHorasMotor: number;
    totalArea: number;
    totalProdH: number;
  };
}

/**
 * Gerar PDF de relatório diário
 */
export async function generateDailyReportPDF(data: DailyReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header com logo John Deere
    doc.fillColor("#367C2B")
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("🚜 Controle de Colheita", { align: "center" });

    doc.fillColor("#FFDE00")
       .fontSize(12)
       .font("Helvetica")
       .text("Relatório Diário de Produção", { align: "center" });

    doc.moveDown(1);

    // Data do relatório
    doc.fillColor("#000000")
       .fontSize(14)
       .font("Helvetica-Bold")
       .text(`Data: ${new Date(data.date).toLocaleDateString("pt-BR")}`, { align: "left" });

    doc.moveDown(1);

    // Tabela de máquinas
    doc.fontSize(12).font("Helvetica-Bold").text("Resumo por Máquina", { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [60, 90, 60, 60, 70, 70, 60];
    const headers = ["Máquina", "Operador", "Chegada", "Saída", "Horas Motor", "Área (ha)", "Prod. (h)"];

    // Header da tabela
    doc.font("Helvetica-Bold").fontSize(10);
    let xPos = 50;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: "left" });
      xPos += colWidths[i];
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Linhas da tabela
    doc.font("Helvetica").fontSize(10);
    data.machines.forEach((machine) => {
      const rowY = doc.y;
      xPos = 50;
      
      const row = [
        `${machine.maquinaId}${machine.nome ? ` - ${machine.nome}` : ""}`,
        machine.operador || "N/A",
        machine.chegadaLavoura || "-",
        machine.saidaLavoura || "-",
        machine.horasMotorDia.toFixed(1),
        machine.areaHa.toFixed(2),
        machine.prodH.toFixed(1),
      ];

      row.forEach((cell, i) => {
        doc.text(cell, xPos, rowY, { width: colWidths[i], align: "left" });
        xPos += colWidths[i];
      });

      doc.moveDown(0.8);
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Totais
    doc.font("Helvetica-Bold").fontSize(12).text("Totais Gerais", { underline: true });
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(10);
    doc.text(`Total Horas Motor: ${data.totals.totalHorasMotor.toFixed(1)}h`);
    doc.text(`Total Área Colhida: ${data.totals.totalArea.toFixed(2)} ha`);
    doc.text(`Total Produção: ${data.totals.totalProdH.toFixed(1)}h`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8)
       .fillColor("#666666")
       .text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, { align: "center" });

    doc.end();
  });
}

/**
 * Gerar PDF de relatório de operadores
 */
export async function generateOperatorsReportPDF(
  data: { from: string; to: string; operators: any[] }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fillColor("#367C2B")
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("🚜 Controle de Colheita", { align: "center" });

    doc.fillColor("#FFDE00")
       .fontSize(12)
       .font("Helvetica")
       .text("Ranking de Operadores", { align: "center" });

    doc.moveDown(1);

    // Período
    doc.fillColor("#000000")
       .fontSize(12)
       .font("Helvetica")
       .text(
         `Período: ${new Date(data.from).toLocaleDateString("pt-BR")} a ${new Date(data.to).toLocaleDateString("pt-BR")}`,
         { align: "left" }
       );

    doc.moveDown(1);

    // Tabela de operadores
    const tableTop = doc.y;
    const colWidths = [40, 150, 80, 80, 80];
    const headers = ["#", "Operador", "Horas Motor", "Área (ha)", "Produtividade"];

    // Header da tabela
    doc.font("Helvetica-Bold").fontSize(10);
    let xPos = 50;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: "left" });
      xPos += colWidths[i];
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Linhas da tabela
    doc.font("Helvetica").fontSize(10);
    data.operators.forEach((operator, index) => {
      const rowY = doc.y;
      xPos = 50;

      const produtividade = operator.totalHorasMotor > 0
        ? (operator.totalArea / operator.totalHorasMotor).toFixed(2)
        : "0.00";

      const row = [
        `${index + 1}º`,
        operator.operador,
        operator.totalHorasMotor.toFixed(1),
        operator.totalArea.toFixed(2),
        `${produtividade} ha/h`,
      ];

      row.forEach((cell, i) => {
        doc.text(cell, xPos, rowY, { width: colWidths[i], align: "left" });
        xPos += colWidths[i];
      });

      doc.moveDown(0.8);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8)
       .fillColor("#666666")
       .text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, { align: "center" });

    doc.end();
  });
}

/**
 * Gerar PDF de relatório de manutenções
 */
export async function generateMaintenanceReportPDF(
  data: { from: string; to: string; maintenanceRecords: any[]; totalCustoPecas: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fillColor("#367C2B")
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("🚜 Controle de Colheita", { align: "center" });

    doc.fillColor("#FFDE00")
       .fontSize(12)
       .font("Helvetica")
       .text("Relatório de Manutenções", { align: "center" });

    doc.moveDown(1);

    // Período
    doc.fillColor("#000000")
       .fontSize(12)
       .font("Helvetica")
       .text(
         `Período: ${new Date(data.from).toLocaleDateString("pt-BR")} a ${new Date(data.to).toLocaleDateString("pt-BR")}`,
         { align: "left" }
       );

    doc.moveDown(1);

    // Resumo
    doc.font("Helvetica-Bold").fontSize(12).text("Resumo Geral");
    doc.font("Helvetica").fontSize(10);
    doc.text(`Total de Manutenções: ${data.maintenanceRecords.length}`);
    doc.text(`Custo Total em Peças: R$ ${data.totalCustoPecas.toFixed(2)}`);

    doc.moveDown(1);

    // Lista de manutenções
    doc.font("Helvetica-Bold").fontSize(12).text("Manutenções Realizadas", { underline: true });
    doc.moveDown(0.5);

    data.maintenanceRecords.forEach((maintenance, index) => {
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text(
        `${index + 1}. ${maintenance.maquinaId} - ${new Date(maintenance.data).toLocaleDateString("pt-BR")}`
      );

      doc.font("Helvetica").fontSize(9);
      doc.text(`   Tipo: ${maintenance.tipo}`);
      doc.text(`   Horímetro: ${maintenance.hmMotor}h`);
      if (maintenance.tempoParadoH) {
        doc.text(`   Tempo Parado: ${maintenance.tempoParadoH}h`);
      }
      if (maintenance.observacoes) {
        doc.text(`   Obs: ${maintenance.observacoes}`);
      }

      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8)
       .fillColor("#666666")
       .text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, { align: "center" });

    doc.end();
  });
}

/**
 * Wrapper para gerar PDF baseado no tipo de relatório
 */
export async function generateReportPDF(
  type: "daily" | "operators" | "maintenance",
  params: { date?: string; from?: string; to?: string }
): Promise<{ buffer: string; filename: string }> {
  const { getDailyReport, getOperatorReport, getMaintenanceReportDetailed } = await import("./db");

  let pdfBuffer: Buffer;
  let filename: string;

  if (type === "daily" && params.date) {
    const data = await getDailyReport(params.date);
    if (!data) throw new Error("Relatório não encontrado");

    const reportData = {
      date: params.date,
      machines: data.logs.map((log: any) => ({
        maquinaId: log.maquinaId,
        nome: log.maquinaNome,
        operador: log.operador,
        chegadaLavoura: log.chegadaLavoura,
        saidaLavoura: log.saidaLavoura,
        horasMotorDia: log.horasMotorDia || 0,
        areaHa: log.areaHa || 0,
        prodH: log.prodH || 0,
      })),
      totals: {
        totalHorasMotor: data.totalHorasMotor,
        totalArea: data.totalArea,
        totalProdH: data.totalHorasProd,
      },
    };

    pdfBuffer = await generateDailyReportPDF(reportData);
    filename = `relatorio-diario-${params.date}.pdf`;
  } else if (type === "operators" && params.from && params.to) {
    const data = await getOperatorReport(params.from, params.to);
    if (!data) throw new Error("Relatório de operadores não encontrado");
    pdfBuffer = await generateOperatorsReportPDF({ from: params.from, to: params.to, operators: data });
    filename = `relatorio-operadores-${params.from}-${params.to}.pdf`;
  } else if (type === "maintenance" && params.from && params.to) {
    const data = await getMaintenanceReportDetailed(params.from, params.to);
    if (!data) throw new Error("Relatório de manutenções não encontrado");
    pdfBuffer = await generateMaintenanceReportPDF({
      from: params.from,
      to: params.to,
      maintenanceRecords: data.maintenanceRecords,
      totalCustoPecas: data.totalCustoPecas,
    });
    filename = `relatorio-manutencoes-${params.from}-${params.to}.pdf`;
  } else {
    throw new Error("Parâmetros inválidos para geração de PDF");
  }

  // Converter buffer para base64 para transmissão via tRPC
  return {
    buffer: pdfBuffer.toString("base64"),
    filename,
  };
}
