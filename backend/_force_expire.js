const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const rs = await pool.query("UPDATE disc_links SET expira_em = NOW() - INTERVAL '1 hour' WHERE status IN ('PENDING', 'PROGRESS') RETURNING id");
  console.log(`Forçou expiração em ${rs.rowCount} links.`);
  await pool.end();
}

run().catch(console.error);
