import PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;

export const prisma = new (PrismaClient as any)();
