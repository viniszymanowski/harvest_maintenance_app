const mysql = require('mysql2/promise');

async function exportData() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('-- Exportando dados das máquinas...');
  const [machines] = await connection.execute('SELECT * FROM machines');
  
  console.log('\n-- INSERT statements para machines:');
  for (const m of machines) {
    console.log(`INSERT INTO machines (id, nome, tipo, modelo, chassi, ano, fabricante, intervaloTrocaOleoHm, intervaloRevisao50hHm, hmMotorAtual, hmTrilhaAtual, implementoAgregadoId) VALUES ('${m.id}', '${m.nome}', '${m.tipo}', '${m.modelo || ''}', '${m.chassi || ''}', ${m.ano || 'NULL'}, ${m.fabricante ? `'${m.fabricante}'` : 'NULL'}, ${m.intervaloTrocaOleoHm}, ${m.intervaloRevisao50hHm}, ${m.hmMotorAtual}, ${m.hmTrilhaAtual}, ${m.implementoAgregadoId ? `'${m.implementoAgregadoId}'` : 'NULL'});`);
  }
  
  await connection.end();
}

exportData().catch(console.error);
