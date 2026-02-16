import PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;

const globalForPrisma = global as unknown as { prisma: any };

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

export const prisma = globalForPrisma.prisma || new (PrismaClient as any)({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
