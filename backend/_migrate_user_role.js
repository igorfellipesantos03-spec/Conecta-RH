require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('=== Usuarios antes da migracao ===');
  const before = await pool.query('SELECT username, role FROM users');
  console.log(before.rows);

  // Normaliza qualquer role que não seja ADMIN, RH ou GESTOR para 'RH'
  const result = await pool.query(`
    UPDATE users
    SET role = 'RH'
    WHERE role NOT IN ('ADMIN', 'RH', 'GESTOR')
    RETURNING username, role
  `);

  console.log(`\n=== ${result.rows.length} usuario(s) normalizado(s) para 'RH' ===`);
  console.log(result.rows);

  console.log('\n=== Usuarios depois da migracao ===');
  const after = await pool.query('SELECT username, role, departament_code FROM users');
  console.log(after.rows);

  await pool.end();
}

main().catch(console.error);
