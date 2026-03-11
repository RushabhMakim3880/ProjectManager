import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const notesCount = await (prisma as any).enquiryNote.count();
        console.log(`EnquiryNote table exists. Current count: ${notesCount}`);
    } catch (e: any) {
        console.error(`Error checking EnquiryNote table: ${e.message}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
