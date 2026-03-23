require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const username = 'test_fallback';
    await client.query(`
      INSERT INTO "users" (id, username, role, active, created_at, updated_at)
      VALUES (gen_random_uuid()::text, $1, 'TI', true, NOW(), NOW())
    `, [username]);
    console.log("Success");
  } catch (e) {
    fs.writeFileSync('err_test.log', e.message + '\n' + (e.detail || '') + '\n' + e.stack);
  } finally {
    await client.end();
  }
}
run();
