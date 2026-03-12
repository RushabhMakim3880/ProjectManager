
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany();
  const templates = await prisma.emailTemplate.findMany();

  console.log('--- LEADS ---');
  console.table(leads);
  console.log('--- TEMPLATES ---');
  console.table(templates);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
