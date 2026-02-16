import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
async function main() {
    const prisma = new PrismaClient();
    const users = [
        { name: 'Rushabh Makim', email: 'rushabh@itcyber.com', password: 'admin123', role: 'ADMIN' },
        { name: 'Akshat Vora', email: 'akshat@itcyber.com', password: 'admin123', role: 'ADMIN' },
        { name: 'Nishit Vegad', email: 'nishit@itcyber.com', password: 'admin123', role: 'ADMIN' },
    ];
    console.log('Seeding default users...');
    try {
        for (const u of users) {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            const user = await prisma.user.upsert({
                where: { email: u.email },
                update: {},
                create: {
                    email: u.email,
                    name: u.name,
                    password: hashedPassword,
                    role: u.role,
                },
            });
            console.log(`Created user: ${user.name} (${user.email})`);
        }
    }
    finally {
        await prisma.$disconnect();
    }
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map