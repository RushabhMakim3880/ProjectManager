import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const notesCount = await prisma.enquiryNote.count();
        console.log(`EnquiryNote table exists. Current count: ${notesCount}`);
    }
    catch (e) {
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
//# sourceMappingURL=check-db.js.map