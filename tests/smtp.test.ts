import { describe, it, expect } from "vitest";
import nodemailer from "nodemailer";

describe("SMTP Configuration", () => {
  it("should validate SMTP credentials", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verificar conexão SMTP
    await expect(transporter.verify()).resolves.toBe(true);
  }, 30000); // 30 segundos de timeout
});
