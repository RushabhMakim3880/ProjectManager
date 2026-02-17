import PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;
const globalForPrisma = global;
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map