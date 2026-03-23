const { PrismaClient } = require('@prisma/client');

let prisma = null;
try {
  // Prevents multiple instances of PrismaClient in development
  const globalForPrisma = global;
  prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (e) {
  console.warn('Failed to initialize Prisma Client:', e.message);
}

module.exports = prisma;
