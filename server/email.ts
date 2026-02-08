import * as db from "./db";
import nodemailer from "nodemailer";

/**
 * Configuração de email (pode ser substituída por variáveis de ambiente)
 */
const EMAIL_CONFIG = {
  from: "Controle de Colheita <noreply@colheita.app>",
  subject: "Relatório Diário de Colheita",
};

/**
 * Criar transporter do Nodemailer
 * Nota: Para produção, configure com SMTP real (Gmail, SendGrid, etc.)
 */
function createTransporter() {
  // Para desenvolvimento/teste, usa Ethereal Email (emails de teste)
  // Em produção, substitua por configuração SMTP real
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "ethereal.user@ethereal.email",
      pass: process.env.SMTP_PASS || "ethereal.password",
    },
  });
}

/**
 * Template HTML para relatório diário
 */
function generateDailyReportHTML(report: any): string {
  const { date, maquinasOperando, maquinasComDivergencia, totalHorasMotor, totalHorasProd, totalHorasMan, totalArea, produtividadeMedia, logs } = report;

  const logsHTML = logs.map((log: any) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${log.maquinaId}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${log.operador || "-"}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${log.horasMotorDia?.toFixed(1) || "0.0"}h</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${log.prodH?.toFixed(1) || "0.0"}h</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${log.areaHa?.toFixed(2) || "0.00"} ha</td>
      <td style="padding: 8px; border: 1px solid #ddd; ${log.divergente ? 'background-color: #fee; color: #c00;' : ''}">${log.divergente ? "⚠️ Sim" : "Não"}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Diário - ${new Date(date).toLocaleDateString("pt-BR")}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #367C2B 0%, #2d6623 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h1 style="margin: 0 0 10px 0; font-size: 28px;">🚜 Relatório Diário de Colheita</h1>
    <p style="margin: 0; font-size: 18px; opacity: 0.9;">${new Date(date).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="margin-top: 0; color: #367C2B;">Resumo Geral</h2>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #367C2B;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Máquinas Operando</div>
        <div style="font-size: 24px; font-weight: bold; color: #367C2B;">${maquinasOperando}</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${maquinasComDivergencia > 0 ? '#ef4444' : '#367C2B'};">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Divergências</div>
        <div style="font-size: 24px; font-weight: bold; color: ${maquinasComDivergencia > 0 ? '#ef4444' : '#367C2B'};">${maquinasComDivergencia}</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Total Horas Motor</div>
        <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${totalHorasMotor.toFixed(1)}h</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Total Horas Produção</div>
        <div style="font-size: 24px; font-weight: bold; color: #6b21a8;">${totalHorasProd.toFixed(1)}h</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #FFDE00;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Área Colhida</div>
        <div style="font-size: 24px; font-weight: bold; color: #d97706;">${totalArea.toFixed(2)} ha</div>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px;">Produtividade Média</div>
        <div style="font-size: 24px; font-weight: bold; color: #0891b2;">${produtividadeMedia.toFixed(2)} ha/h</div>
      </div>
    </div>
  </div>

  <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
    <h2 style="margin-top: 0; color: #367C2B;">Detalhamento por Máquina</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Máquina</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Operador</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Horas Motor</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Horas Prod</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Área (ha)</th>
          <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600;">Divergência</th>
        </tr>
      </thead>
      <tbody>
        ${logsHTML}
      </tbody>
    </table>
  </div>

  <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 10px; text-align: center; color: #6b7280; font-size: 14px;">
    <p style="margin: 0;">Este é um relatório automático gerado pelo sistema Controle de Colheita.</p>
    <p style="margin: 5px 0 0 0;">Para mais informações, acesse o aplicativo móvel.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Enviar relatório diário por email
 */
export async function sendDailyReport(date: string, recipientEmail: string): Promise<boolean> {
  try {
    // Buscar dados do relatório
    const report = await db.getDailyReport(date);
    
    if (!report) {
      console.error("[Email] Não foi possível gerar relatório para", date);
      return false;
    }

    // Gerar HTML do relatório
    const htmlContent = generateDailyReportHTML(report);

    // Criar transporter
    const transporter = createTransporter();

    // Enviar email
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: `${EMAIL_CONFIG.subject} - ${new Date(date).toLocaleDateString("pt-BR")}`,
      html: htmlContent,
    });

    console.log("[Email] Relatório enviado com sucesso:", info.messageId);
    console.log("[Email] Preview URL:", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar relatório:", error);
    return false;
  }
}

/**
 * Enviar relatório de teste
 */
export async function sendTestReport(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar dados do relatório de hoje
    const today = new Date().toISOString().split("T")[0];
    const report = await db.getDailyReport(today);
    
    if (!report) {
      return {
        success: false,
        message: "Não há dados para gerar relatório de teste. Adicione lançamentos primeiro."
      };
    }

    // Gerar HTML do relatório
    const htmlContent = generateDailyReportHTML(report);

    // Criar transporter
    const transporter = createTransporter();

    // Enviar email de teste
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: `[TESTE] ${EMAIL_CONFIG.subject} - ${new Date(today).toLocaleDateString("pt-BR")}`,
      html: htmlContent,
    });

    console.log("[Email] Email de teste enviado:", info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("[Email] Preview URL:", previewUrl);
    
    return {
      success: true,
      message: `Relatório de teste enviado com sucesso para ${email}${previewUrl ? `\n\nVisualize em: ${previewUrl}` : ""}`
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar relatório de teste:", error);
    return {
      success: false,
      message: `Erro ao enviar email: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    };
  }
}

/**
 * Agendar envio automático diário
 * Esta função deve ser chamada no servidor ao iniciar
 */
export async function scheduleDailyReport() {
  // Buscar configurações do banco
  const settings = await db.getSettings();
  
  if (!settings?.envioEmailAtivo || !settings?.emailDestinatario) {
    console.log("[Email] Envio automático desativado ou sem email configurado");
    return;
  }
  
  const scheduleTime = settings.horarioEnvioEmail || "18:00";
  const recipientEmail = settings.emailDestinatario;
  
  console.log(`[Email] Relatório diário agendado para ${scheduleTime} → ${recipientEmail}`);
  
  // Calcular tempo até próximo envio
  const now = new Date();
  const [hours, minutes] = scheduleTime.split(":").map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // Se já passou da hora hoje, agendar para amanhã
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilNext = scheduledTime.getTime() - now.getTime();
  
  // Agendar primeiro envio
  setTimeout(async () => {
    // Enviar relatório do dia anterior
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];
    
    await sendDailyReport(dateStr, recipientEmail);
    
    // Agendar próximos envios (a cada 24 horas)
    setInterval(async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];
      
      await sendDailyReport(dateStr, recipientEmail);
    }, 24 * 60 * 60 * 1000); // 24 horas
  }, timeUntilNext);
}
