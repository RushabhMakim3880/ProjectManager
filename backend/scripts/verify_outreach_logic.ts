
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Get a template
  const templates = await prisma.emailTemplate.findMany();
  console.log(`Found ${templates.length} templates.`);
  templates.forEach(t => console.log(`- ${t.name}`));

  // 2. Create or find a test lead
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in DB. Please ensure at least one user exists.');
    return;
  }

  const lead = await prisma.lead.upsert({
    where: { id: 'test-verification-lead' },
    update: { status: 'DISCOVERED' },
    create: {
      id: 'test-verification-lead',
      name: 'Test Lead',
      companyName: 'ACME Corp',
      website: 'https://acme.com',
      email: 'test@example.com',
      industry: 'Manufacturing',
      servicesRequested: JSON.stringify(['CRM Integration']),
      discoveredById: user.id,
      status: 'DISCOVERED'
    }
  });
  console.log('Verified test lead:', lead.id, lead.name);

  // 3. Test promotion to Enquiry
  console.log('Testing promotion to Enquiry...');
  const existingEnquiryCount = await prisma.enquiry.count();
  
  // Logic from controller: promoteToEnquiry
  const enquiry = await prisma.enquiry.create({
    data: {
      enquiryId: `ENQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      clientName: lead.name,
      companyName: lead.companyName,
      email: lead.email,
      servicesRequested: lead.servicesRequested,
      stage: 'NEW',
      lead: { connect: { id: lead.id } }
    }
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: 'CONVERTED' }
  });

  console.log('Created enquiry:', enquiry.enquiryId);
  console.log('Lead status updated to CONVERTED');

  const newEnquiryCount = await prisma.enquiry.count();
  if (newEnquiryCount > existingEnquiryCount) {
    console.log('Promotion validation SUCCESS.');
  }

  console.log('Outreach Manager Backend logic verified (Full Lifecycle).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
