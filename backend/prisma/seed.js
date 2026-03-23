require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const tiUsers = [
  'alisson.pereira', 'bruno.lamounier', 'diorgny',
  'fernando.pereira', 'gabriel.sales', 'gabriel.viana', 'igor.fellipe',
  'victor.moraes'
];

const rhUsers = [
  'esther.cotta', 'bruno.costa', 'anderson.araujo', 'ketlen.santos',
  'kenny.bertolazo', 'daiane.cintra', 'eduardo.cardoso', 'luis.borgo',
  'yasmin.pelicaro'
];

async function main() {
  console.log('Start seeding...');

  try {
    const prisma = new PrismaClient();
    for (const username of tiUsers) {
      await prisma.user.upsert({
        where: { username },
        update: { role: 'Tecnologia da Informação', active: true },
        create: { username, role: 'Tecnologia da Informação', active: true },
      });
    }

    for (const username of rhUsers) {
      await prisma.user.upsert({
        where: { username },
        update: { role: 'Recursos Humanos', active: true },
        create: { username, role: 'Recursos Humanos', active: true },
      });
    }
  } catch (e) {
    console.warn('Prisma client falhou com', e.message, 'usando fallback raw pg...');
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    for (const username of tiUsers) {
      await client.query(`
        INSERT INTO "users" (id, username, role, active, created_at, updated_at)
        VALUES (gen_random_uuid()::text, $1, 'Tecnologia da Informação', true, NOW(), NOW())
        ON CONFLICT (username) DO UPDATE SET role = 'Tecnologia da Informação', active = true, updated_at = NOW();
      `, [username]);
    }
    for (const username of rhUsers) {
      await client.query(`
        INSERT INTO "users" (id, username, role, active, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 'Recursos Humanos', true, NOW(), NOW())
        ON CONFLICT (username) DO UPDATE SET role = 'Recursos Humanos', active = true, updated_at = NOW();
      `, [username]);
    }
    await client.end();
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
