import twilio from "twilio";
import * as db from "./db";

/**
 * Configuração do Twilio WhatsApp
 * 
 * Para configurar:
 * 1. Crie uma conta em https://www.twilio.com/
 * 2. Ative o WhatsApp Sandbox em https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
 * 3. Siga as instruções para conectar seu número WhatsApp ao sandbox
 * 4. Configure as variáveis de ambiente:
 *    - TWILIO_ACCOUNT_SID: Account SID da sua conta Twilio
 *    - TWILIO_AUTH_TOKEN: Auth Token da sua conta Twilio
 *    - TWILIO_WHATSAPP_FROM: Número WhatsApp do Twilio (formato: whatsapp:+14155238886)
 * 
 * Para produção (após aprovação do Twilio):
 * - Substitua o número do sandbox pelo seu número aprovado
 * - O formato do destinatário deve ser: whatsapp:+5511999999999
 */

/**
 * Criar cliente Twilio
 */
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error(
      "Credenciais Twilio não configuradas. Configure TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN"
    );
  }

  return twilio(accountSid, authToken);
}

/**
 * Formatar número de telefone para WhatsApp
 */
function formatWhatsAppNumber(phoneNumber: string): string {
  // Remove caracteres não numéricos
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Adiciona código do país se não tiver
  const withCountryCode = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  
  // Retorna no formato whatsapp:+5511999999999
  return `whatsapp:+${withCountryCode}`;
}

/**
 * Enviar mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; message: string; sid?: string }> {
  try {
    const client = createTwilioClient();
    const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
    const formattedTo = formatWhatsAppNumber(to);

    const result = await client.messages.create({
      from,
      to: formattedTo,
      body: message,
    });

    console.log("[WhatsApp] Mensagem enviada:", result.sid);
    return {
      success: true,
      message: `Mensagem enviada com sucesso para ${to}`,
      sid: result.sid,
    };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    return {
      success: false,
      message: `Erro ao enviar WhatsApp: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

/**
 * Enviar mensagem com mídia (PDF) via WhatsApp
 */
export async function sendWhatsAppWithMedia(
  to: string,
  message: string,
  mediaUrl: string
): Promise<{ success: boolean; message: string; sid?: string }> {
  try {
    const client = createTwilioClient();
    const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
    const formattedTo = formatWhatsAppNumber(to);

    const result = await client.messages.create({
      from,
      to: formattedTo,
      body: message,
      mediaUrl: [mediaUrl],
    });

    console.log("[WhatsApp] Mensagem com mídia enviada:", result.sid);
    return {
      success: true,
      message: `Mensagem com PDF enviada com sucesso para ${to}`,
      sid: result.sid,
    };
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem com mídia:", error);
    return {
      success: false,
      message: `Erro ao enviar WhatsApp: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

/**
 * Enviar relatório diário via WhatsApp
 */
export async function sendDailyReportWhatsApp(
  date: string,
  phoneNumber: string,
  pdfUrl?: string
): Promise<boolean> {
  try {
    // Buscar dados do relatório
    const report = await db.getDailyReport(date);

    if (!report) {
      console.error("[WhatsApp] Não foi possível gerar relatório para", date);
      return false;
    }

    // Gerar mensagem de texto
    const message = `
🚜 *Relatório Diário de Colheita*
📅 ${new Date(date).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

📊 *Resumo Geral:*
• Máquinas operando: ${report.maquinasOperando}
• Divergências: ${report.maquinasComDivergencia}
• Total horas motor: ${report.totalHorasMotor.toFixed(1)}h
• Total horas produção: ${report.totalHorasProd.toFixed(1)}h
• Área colhida: ${report.totalArea.toFixed(2)} ha
• Produtividade média: ${report.produtividadeMedia.toFixed(2)} ha/h

📋 *Detalhamento:*
${report.logs.map((log: any) => 
  `${log.maquinaId} - ${log.operador || "Sem operador"}: ${log.horasMotorDia?.toFixed(1) || "0.0"}h motor, ${log.areaHa?.toFixed(2) || "0.00"} ha${log.divergente ? " ⚠️" : ""}`
).join("\n")}

${pdfUrl ? "\n📄 PDF anexado" : ""}
    `.trim();

    // Enviar com ou sem PDF
    let result;
    if (pdfUrl) {
      result = await sendWhatsAppWithMedia(phoneNumber, message, pdfUrl);
    } else {
      result = await sendWhatsAppMessage(phoneNumber, message);
    }

    return result.success;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar relatório:", error);
    return false;
  }
}

/**
 * Enviar relatório de teste via WhatsApp
 */
export async function sendTestReportWhatsApp(
  phoneNumber: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar dados do relatório de hoje
    const today = new Date().toISOString().split("T")[0];
    const report = await db.getDailyReport(today);

    if (!report) {
      return {
        success: false,
        message: "Não há dados para gerar relatório de teste. Adicione lançamentos primeiro.",
      };
    }

    // Gerar mensagem de teste
    const message = `
🧪 *[TESTE] Relatório Diário de Colheita*
📅 ${new Date(today).toLocaleDateString("pt-BR")}

📊 *Resumo:*
• Máquinas operando: ${report.maquinasOperando}
• Total horas motor: ${report.totalHorasMotor.toFixed(1)}h
• Área colhida: ${report.totalArea.toFixed(2)} ha

✅ Sistema de notificações WhatsApp configurado com sucesso!
    `.trim();

    const result = await sendWhatsAppMessage(phoneNumber, message);

    if (result.success) {
      return {
        success: true,
        message: `Relatório de teste enviado com sucesso para ${phoneNumber}`,
      };
    } else {
      return result;
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar relatório de teste:", error);
    return {
      success: false,
      message: `Erro ao enviar WhatsApp: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

/**
 * Agendar envio automático diário via WhatsApp
 */
export async function scheduleDailyReportWhatsApp() {
  // Buscar configurações do banco
  const settings = await db.getSettings();

  if (!settings?.envioWhatsappAtivo || !settings?.whatsappNumero) {
    console.log("[WhatsApp] Envio automático desativado ou sem número configurado");
    return;
  }

  const scheduleTime = settings.horarioEnvioEmail || "18:00"; // Usa mesmo horário do email
  const phoneNumber = settings.whatsappNumero;

  console.log(`[WhatsApp] Relatório diário agendado para ${scheduleTime} → ${phoneNumber}`);

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

    await sendDailyReportWhatsApp(dateStr, phoneNumber);

    // Agendar próximos envios (a cada 24 horas)
    setInterval(async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];

      await sendDailyReportWhatsApp(dateStr, phoneNumber);
    }, 24 * 60 * 60 * 1000); // 24 horas
  }, timeUntilNext);
}
