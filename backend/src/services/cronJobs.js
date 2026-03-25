const cron = require('node-cron');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Tarefa em Background: Executa a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  try {
    const agora = new Date();

    // UPDATE em massa para expirar links ativos cujo tempo já passou
    const result = await prisma.discLink.updateMany({
      where: {
        isActive: true,
        expiraEm: {
          lt: agora // menores que AGORA
        }
      },
      data: {
        status: 'EXPIRED',
        isActive: false
      }
    });

    if (result.count > 0) {
      console.log(`[CRON] ${result.count} links do DISC expirados com sucesso.`);
    }
  } catch (error) {
    console.error('[CRON] Erro ao processar varredura de links expirados:', error);
  }
});
