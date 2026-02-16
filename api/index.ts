import express from 'express';
const app = express();

// ABSOLUTELY NO IMPORTS FROM BACKEND
// THIS IS A PURE ISOLATION TEST

app.get('/api/ping', (req, res) => {
    res.json({
        msg: 'Isolator Test: Bridge is alive',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/debug/load-prisma', async (req, res) => {
    try {
        console.log('DEBUG: Attempting dynamic import of Prisma...');
        const { prisma } = await import('../backend/src/lib/prisma.js');
        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        res.json({
            msg: 'Prisma module loaded successfully',
            db_url_present: !!dbUrl,
            db_url_start: dbUrl?.substring(0, 10)
        });
    } catch (err: any) {
        console.error('DEBUG_LOAD_FAILURE:', err);
        res.status(500).json({
            error: 'Prisma load failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.get('/api/debug/load-backend', async (req, res) => {
    try {
        console.log('DEBUG: Attempting dynamic import of Backend App...');
        const { app: backendApp } = await import('../backend/src/index.js');
        res.json({ msg: 'Backend main module loaded successfully' });
    } catch (err: any) {
        console.error('DEBUG_LOAD_FAILURE:', err);
        res.status(500).json({
            error: 'Backend load failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.get('/api/debug/query-test', async (req, res) => {
    try {
        console.log('DEBUG: Attempting Prisma Query...');
        const { prisma } = await import('../backend/src/lib/prisma.js');

        // This is the moment of truth: Does the connection kill the lambda?
        const result = await prisma.$queryRaw`SELECT 1 as test`;

        res.json({
            msg: 'Prisma Query Success!',
            result: result
        });
    } catch (err: any) {
        console.error('DEBUG_QUERY_FAILURE:', err);
        res.status(500).json({
            error: 'Prisma Query Failed',
            message: err.message,
            code: err.code,
            meta: err.meta,
            stack: err.stack
        });
    }
});

app.get('/api/debug/tables', async (req, res) => {
    try {
        console.log('DEBUG: Listing tables...');
        const { prisma } = await import('../backend/src/lib/prisma.js');

        // List all tables in the public schema (PostgreSQL specific)
        const tables: any[] = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        res.json({
            msg: 'Table list retrieved',
            count: tables.length,
            tables: tables.map(t => t.table_name)
        });
    } catch (err: any) {
        console.error('DEBUG_TABLES_FAILURE:', err);
        res.status(500).json({
            error: 'Table list failed',
            message: err.message,
            stack: err.stack
        });
    }
});

app.get('/api/debug/seed-admin', async (req, res) => {
    try {
        console.log('DEBUG: Seeding admin user...');
        const { prisma } = await import('../backend/src/lib/prisma.js');
        const bcrypt = await import('bcryptjs');

        const email = 'admin@protrack.com';
        const password = 'Password@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                name: 'System Admin',
                role: 'ADMIN'
            }
        });

        res.json({
            msg: 'Admin user seeded successfully',
            user: { id: user.id, email: user.email, role: user.role },
            login_credentials: { email, password }
        });
    } catch (err: any) {
        console.error('DEBUG_SEED_FAILURE:', err);
        res.status(500).json({
            error: 'Seed failed',
            message: err.message,
            stack: err.stack
        });
    }
});
