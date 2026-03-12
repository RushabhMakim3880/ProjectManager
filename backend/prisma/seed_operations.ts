import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Sample Partners and Projects for Operations Dashboard (v2)...');

    const partnerData = [
        { name: 'John Doe', email: 'john@example.com', skills: 'React, Node.js, TypeScript, Next.js' },
        { name: 'Jane Smith', email: 'jane@example.com', skills: 'UI/UX, Figma, React, CSS' },
        { name: 'Mike Ross', email: 'mike@example.com', skills: 'Prisma, PostgreSQL, Backend, Security' },
        { name: 'Rachel Zane', email: 'rachel@example.com', skills: 'QA, Testing, Cypress, Automation' }
    ];

    const createdPartners = [];
    const password = await bcrypt.hash('partner123', 10);

    for (const p of partnerData) {
        // Create User first
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {},
            create: {
                email: p.email,
                name: p.name,
                password: password,
                role: 'PARTNER',
            }
        });

        // Create Partner profile
        const partner = await prisma.partner.upsert({
            where: { userId: user.id },
            update: {
                skills: p.skills,
                canLeadProjects: true,
            },
            create: {
                userId: user.id,
                skills: p.skills,
                canLeadProjects: true,
            }
        });
        
        createdPartners.push({ ...partner, name: user.name });
        console.log(`- Partner/User created: ${user.name}`);
    }

    // 2. Create Sample Projects and Assign Leads
    const projects = [
        {
            name: 'Alpha Corporate Website',
            clientName: 'Alpha Corp',
            totalValue: 500000,
            startDate: new Date(),
            status: 'ACTIVE',
            projectLeadId: createdPartners[0].id, // John
            techLeadId: createdPartners[2].id,    // Mike
            commsLeadId: createdPartners[1].id,   // Jane
        },
        {
            name: 'Beta Mobile App',
            clientName: 'Beta Systems',
            totalValue: 750000,
            startDate: new Date(),
            status: 'ACTIVE',
            projectLeadId: createdPartners[0].id, // John (Overloading John)
            techLeadId: createdPartners[0].id,    // John
            commsLeadId: createdPartners[1].id,   // Jane
        },
        {
            name: 'Gamma Security Audit',
            clientName: 'Gamma Security',
            totalValue: 200000,
            startDate: new Date(),
            status: 'ACTIVE',
            projectLeadId: createdPartners[2].id, // Mike
            techLeadId: createdPartners[2].id,    // Mike
        }
    ];

    for (const p of projects) {
        const project = await prisma.project.create({
            data: p
        });
        console.log(`- Project created: ${project.name}`);
    }

    console.log('Operations seeding v2 finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
