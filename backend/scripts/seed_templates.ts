
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Formal Introduction',
    subject: 'Strategic Partnership Opportunity / {{companyName}}',
    body: `Dear {{contactPerson}},

I've been following {{companyName}}'s impressive growth in the {{niche}} sector and was particularly struck by your recent work.

At Project Manager CRM, we specialize in helping companies like yours optimize internal workflows and boost operational efficiency through our suite of high-end management tools.

I'd love to share how our specialized services can help {{companyName}} scale even faster. Are you available for a brief 10-minute call later this week?

Best regards,

Rushabh Makim
Founder, Project Manager CRM`,
  },
  {
    name: 'Direct Value Proposition',
    subject: 'Enhancing {{companyName}}\'s Efficiency',
    body: `Hi {{contactPerson}},

I noticed that {{companyName}} is doing some great things in the {{niche}} space, but I also see an opportunity for significant optimization.

We have a proven track record of helping similar firms reduce project turnaround times by up to 30%. Our core services include:
- Bespoke CRM Integration
- Real-time Analytics Dashboard
- Automated Client Reporting

I'd love to show you a quick demo of how this would look for {{companyName}}. Does Wednesday at 2 PM work for you?

Best,

Rushabh Makim`,
  },
  {
    name: 'Follow-up / Persistent',
    subject: 'Re: Strategic Alignment for {{companyName}}',
    body: `Hi {{contactPerson}},

Just moving this to the top of your inbox. I'm truly excited about the potential synergy between Project Manager CRM and {{companyName}}.

Our latest analysis of the {{niche}} market shows that efficiency is the #1 growth driver this year. Let me know if you'd like to see our case studies.

Looking forward to hearing from you,

Rushabh Makim`,
  },
];

async function main() {
  console.log('Seeding email templates...');
  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
