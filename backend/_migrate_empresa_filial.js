/**
 * Script de migração: Define empresa_id = '07' e filial_id = '01' para todos
 * os usuários existentes que ainda não possuem esses campos.
 *
 * Executar uma única vez após a migration do Prisma:
 *   node _migrate_empresa_filial.js
 */
require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `UPDATE users SET empresa_id = '07', filial_id = '01' WHERE empresa_id IS NULL OR filial_id IS NULL`
    );
    console.log(`✅ ${result.rowCount} usuário(s) atualizado(s) com empresa 07 / filial 01.`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

main();
