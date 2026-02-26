import PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;

const globalForPrisma = global as unknown as { prisma: any };

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (dbUrl) {
    const maskedUrl = dbUrl.replace(/:[^@:]+@/, ':****@');
    console.log(`Initializing Prisma with URL: ${maskedUrl}`);
} else {
    console.error('DATABASE_URL is not defined in environment variables!');
}

export const prisma = globalForPrisma.prisma || new (PrismaClient as any)({
    datasources: {
        db: {
            url: dbUrl
        }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
