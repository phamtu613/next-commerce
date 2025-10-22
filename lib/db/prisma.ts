import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL missing in .env');
}

export const prisma = new PrismaClient();

console.log('🧩 DATABASE_URL =', process.env.DATABASE_URL);
