import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // 1. Inserir fazendas
    console.log("📦 Inserindo fazendas...");
    await db.insert(schema.fazendas).values([
      {
        nome: "Fazenda Santa Rita",
        localizacao: "Sorriso - MT",
        areaTotal: 1500,
        ativo: true,
      },
      {
        nome: "Fazenda Boa Esperança",
        localizacao: "Primavera do Leste - MT",
        areaTotal: 2200,
        ativo: true,
      },
      {
        nome: "Fazenda São João",
        localizacao: "Lucas do Rio Verde - MT",
        areaTotal: 1800,
        ativo: true,
      },
    ]);
    console.log("✅ Fazendas inseridas!");

    // 2. Inserir talhões
    console.log("📦 Inserindo talhões...");
    await db.insert(schema.talhoes).values([
      { fazendaId: 1, nome: "Talhão A1", areaHa: 150, cultura: "Soja", ativo: true },
      { fazendaId: 1, nome: "Talhão A2", areaHa: 180, cultura: "Soja", ativo: true },
      { fazendaId: 2, nome: "Talhão B1", areaHa: 200, cultura: "Soja", ativo: true },
      { fazendaId: 2, nome: "Talhão B2", areaHa: 220, cultura: "Soja", ativo: true },
      { fazendaId: 3, nome: "Talhão C1", areaHa: 160, cultura: "Soja", ativo: true },
    ]);
    console.log("✅ Talhões inseridos!");

    // 3. Inserir operadores
    console.log("📦 Inserindo operadores...");
    await db.insert(schema.operadores).values([
      { nome: "João Silva", cpf: "123.456.789-00", telefone: "(65) 99999-1111", ativo: true },
      { nome: "Pedro Santos", cpf: "234.567.890-11", telefone: "(65) 99999-2222", ativo: true },
      { nome: "Carlos Oliveira", cpf: "345.678.901-22", telefone: "(65) 99999-3333", ativo: true },
      { nome: "José Costa", cpf: "456.789.012-33", telefone: "(65) 99999-4444", ativo: true },
    ]);
    console.log("✅ Operadores inseridos!");

    console.log("🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  } finally {
    await connection.end();
  }
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
