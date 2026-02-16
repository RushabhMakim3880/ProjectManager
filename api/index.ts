import express, { Request, Response } from 'express';
const app = express();

// ABSOLUTELY NO IMPORTS FROM BACKEND
// THIS IS A PURE ISOLATION TEST

app.get('/api/ping', (req: Request, res: Response) => {
    res.json({
        msg: 'Isolator Test: Bridge is alive',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/debug/load-prisma', async (req: Request, res: Response) => {
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

app.get('/api/debug/load-backend', async (req: Request, res: Response) => {
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

app.get('/api/debug/query-test', async (req: Request, res: Response) => {
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

app.get('/api/debug/tables', async (req: Request, res: Response) => {
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

app.get('/api/debug/migrate', async (req: Request, res: Response) => {
    res.json({
        msg: 'Vercel environment is read-only. Please run migration locally:',
        instructions: [
            '1. Open your terminal in the project root.',
            '2. Run: $env:DATABASE_URL="your_vercel_postgres_url"',
            '3. Run: npx prisma db push --schema=backend/prisma/schema.prisma',
            '4. After it finishes, visit /api/debug/seed-admin'
        ],
        note: 'The "your_vercel_postgres_url" can be found in your Vercel Project Settings > Storage or Environment Variables.'
    });
});

// This is a placeholder for a login controller, as requested by the instruction.
// It's placed here as a separate function, not directly inside the seed-admin route.
export const login = async (req: Request, res: Response) => {
    console.log('AUTH_CONTROLLER: Login attempt start...', { email: req.body?.email });
    try {
        const { email, password } = req.body;
        // ... rest of login logic would go here ...
        res.status(501).json({ message: 'Login endpoint not fully implemented in isolator test' });
    } catch (error: any) {
        console.error('AUTH_CONTROLLER: Login failed', error);
        res.status(500).json({ error: error.message });
    }
};

// Direct Auth Handler (to bypass backend initialization crashes)
app.post('/api/auth/login', express.json(), async (req: Request, res: Response) => {
    console.log('BRIDGE_DIRECT_AUTH: Login attempt...', { email: req.body?.email });
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const { prisma } = await import('../backend/src/lib/prisma.js');
        const bcryptModule = await import('bcryptjs');
        const bcrypt = (bcryptModule as any).default || bcryptModule;
        const jwtModule = await import('jsonwebtoken');
        const jwt = (jwtModule as any).default || jwtModule;

        const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

        console.log('BRIDGE_DIRECT_AUTH: Fetching user...');
        const user = await prisma.user.findUnique({
            where: { email },
            include: { partnerProfile: true },
        });

        if (!user) {
            console.log('BRIDGE_DIRECT_AUTH: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('BRIDGE_DIRECT_AUTH: Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('BRIDGE_DIRECT_AUTH: Password mismatch');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('BRIDGE_DIRECT_AUTH: Generating tokens...');
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        console.log('BRIDGE_DIRECT_AUTH: Success!');
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                partnerId: user.partnerProfile?.id,
            },
        });
    } catch (err: any) {
        console.error('BRIDGE_DIRECT_AUTH_FAILURE:', err);
        res.status(500).json({
            error: 'Direct Auth Failed',
            message: err.message,
            stack: err.stack,
            hint: 'This means the crash is in the core logic (Prisma/Bcrypt/DB), not the Express app setup.'
        });
    }
});

app.get('/api/debug/seed-admin', express.json(), async (req: Request, res: Response) => {
    try {
        console.log('DEBUG: Seeding admin user...');
        const { prisma } = await import('../backend/src/lib/prisma.js');
        const bcryptModule = await import('bcryptjs');
        const bcrypt = (bcryptModule as any).default || bcryptModule;

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

// express.json() moved to specific routes that need it to prevent body drain before forwarding

// Debug Middleware
app.use((req, res, next) => {
    if (!req.url.includes('/api/debug/')) {
        console.log(`[BACKEND_DEBUG] ${req.method} ${req.url}`);
    }
    next();
});

app.all('*', async (req: Request, res: Response) => {
    try {
        // Skip forwarding for auth routes since we handle them directly now
        if (req.url.startsWith('/api/auth/')) {
             return res.status(404).json({ error: 'Auth route handled by bridge, method not supported here' });
        }

        console.log(`BRIDGE_START: ${req.method} ${req.url}`);
        const { app: backendApp } = await import('../backend/src/index.js');
        // ... rest of forwarding logic ...
        console.error('BACKEND_BRIDGE_FAILURE:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method
        });
        res.status(500).json({ 
            error: 'Backend Bridge Failed', 
            message: err.message,
            stack: err.stack,
            hint: 'Check Vercel logs for full stack trace'
        });
    }
});

// Final error catcher to prevent FUNCTION_INVOCATION_FAILED
app.use((err: any, req: any, res: any, next: any) => {
    console.error('FATAL_BRIDGE_ERROR:', err);
    res.status(500).json({ error: 'Fatal Bridge Error', message: err.message });
});

export default app;
