/**
 * Script para adicionar colunas empresa_id e filial_id na tabela users
 * e definir valores padrão para os registros existentes.
 *
 * Executar ANTES de reiniciar o backend:
 *   node _add_empresa_filial_columns.js
 *
 * Depois de rodar este script, sincronize o Prisma:
 *   npx prisma db pull
 *   npx prisma generate
 */
require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 1. Adiciona as colunas se não existirem
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS empresa_id VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS filial_id VARCHAR;
    `);
    console.log('✅ Colunas empresa_id e filial_id adicionadas (ou já existiam).');

    // 2. Define valores padrão para registros existentes
    const result = await pool.query(
      `UPDATE users SET empresa_id = '07', filial_id = '01' WHERE empresa_id IS NULL OR filial_id IS NULL`
    );
    console.log(`✅ ${result.rowCount} usuário(s) atualizado(s) com empresa 07 / filial 01.`);

    // 3. Lista os registros atualizados
    const users = await pool.query('SELECT username, role, empresa_id, filial_id FROM users ORDER BY created_at DESC');
    console.log('\n📋 Usuários no sistema:');
    users.rows.forEach(u => {
      console.log(`   ${u.username} | role: ${u.role} | empresa: ${u.empresa_id} | filial: ${u.filial_id}`);
    });

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

main();
