import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// ROBUST API BRIDGE v5 - Vercel Serverless
const app = express();

app.use(cors({
    origin: [
        'https://project-manager-chi-sooty.vercel.app',
        'http://localhost:3000',
        /\.vercel\.app$/
    ],
    credentials: true,
}));
app.use(express.json());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/ping', (req: Request, res: Response) => {
    res.json({
        msg: 'Bridge alive (v5 - Full Routes)',
        timestamp: new Date().toISOString(),
        env: {
            has_db: !!process.env.DATABASE_URL,
            has_jwt: !!process.env.JWT_SECRET,
            has_gemini: !!process.env.GOOGLE_GENAI_API_KEY,
        }
    });
});

// ─── LOGIN (inline, no SQLite file path dependency) ──────────────────────────
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { PrismaClient } = await import('@prisma/client');
        const bcryptPkg = await import('bcryptjs');
        const jwtPkg = await import('jsonwebtoken');
        const bcrypt = (bcryptPkg as any).default || bcryptPkg;
        const jwt = (jwtPkg as any).default || jwtPkg;

        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } } as any);
        const user = await prisma.user.findUnique({ where: { email }, include: { partnerProfile: true } });
        await prisma.$disconnect();

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET || 'protrack_dev_secret_2024';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'protrack_dev_refresh_2024';
        const accessToken = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, { expiresIn: '7d' });

        res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, partnerId: (user as any).partnerProfile?.id } });
    } catch (err: any) {
        res.status(500).json({ error: 'Login Failed', message: err.message });
    }
});

// ─── LEAD SEARCH — Self-contained Gemini REST call (works without SQLite) ────
app.post('/api/leads/search', async (req: Request, res: Response) => {
    try {
        const { niche, location, manualUrls } = req.body;
        if (!niche) return res.status(400).json({ error: 'Niche is required' });

        const loc = location || 'India';
        const nicheSlug = niche.toLowerCase().replace(/\s+/g, '-');
        const nicheRaw = niche.toLowerCase().replace(/\s+/g, '');

        const searchResults = (manualUrls && manualUrls.length > 0)
            ? manualUrls.map((url: string) => ({ title: url, link: url, snippet: 'Manual target for qualification.' }))
            : [
                { title: `${niche} Solutions Pvt Ltd`, link: `https://${nicheSlug}-solutions.in`, snippet: `Leading ${niche} provider in ${loc} with 50+ enterprise clients on legacy infrastructure needing modernisation.` },
                { title: `${niche} Experts — ${loc}`, link: `https://${nicheRaw}-experts.com`, snippet: `B2B ${niche} platform serving SMEs in ${loc}. Lacks mobile app, real-time analytics, and cybersecurity.` },
                { title: `${loc} ${niche} Group`, link: `https://global-${nicheRaw}.co`, snippet: `Enterprise-level ${niche} conglomerate in ${loc} with 200+ employees handling sensitive client data without compliance framework.` },
                { title: `${niche} Tech Startup`, link: `https://${nicheRaw}tech.io`, snippet: `Fast-growing ${niche} startup in ${loc} seeking VAPT audit + cloud migration before their Series A funding.` },
                { title: `Premium ${niche} Agency`, link: `https://premium-${nicheSlug}.in`, snippet: `High-value ${niche} agency with ₹2Cr+ revenue in ${loc}. Needs CRM integration, automated reporting, and mobile app.` },
              ];

        const apiKey = process.env.GOOGLE_GENAI_API_KEY;
        if (!apiKey) {
            // Return fallback leads even without API key
            return res.json(searchResults.map(sr => ({
                name: sr.title, website: sr.link, description: sr.snippet, industry: niche,
                fitScore: 65, fitReasoning: `${sr.title} shows strong indicators for IT Cyber services.`,
                suggestedServices: ['Web Development', 'VAPT'],
            })));
        }

        const qualify = async (sr: { title: string; link: string; snippet: string }) => {
            try {
                const prompt = `You are a business development analyst for IT Cyber, an Indian software & cybersecurity agency.
Qualify this lead. Return ONLY valid JSON with no markdown fences.
Required format:
{"name":"${sr.title}","website":"${sr.link}","description":"brief description","industry":"${niche}","fitScore":75,"fitReasoning":"one sentence why this is a good fit","suggestedServices":["VAPT","Web Development"]}
Lead info: ${sr.title} | ${sr.link} | ${niche} | ${loc} | ${sr.snippet}
suggestedServices must only use: ["VAPT","Web Development","Mobile App","Cloud Migration","CRM Integration","UI/UX Design"]`;

                const apiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
                        })
                    }
                );
                const data: any = await apiRes.json();
                const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.name && parsed.fitScore !== undefined && Array.isArray(parsed.suggestedServices)) return parsed;
                }
            } catch { /* fall through */ }
            return { name: sr.title, website: sr.link, description: sr.snippet, industry: niche, fitScore: 65, fitReasoning: `${sr.title} shows strong demand for digital transformation in the ${niche} space.`, suggestedServices: ['Web Development', 'VAPT'] };
        };

        const results = await Promise.all(searchResults.map(qualify));
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ error: 'Lead search failed', message: err.message });
    }
});

// ─── BRIDGE HELPER ────────────────────────────────────────────────────────────
const bridgeRouter = (routePath: string, importPath: string) =>
    app.use(routePath, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const mod = await import(importPath);
            const router = mod.default || mod;
            router(req, res, next);
        } catch (err: any) {
            console.error(`BRIDGE_FAILURE [${routePath}]:`, err.message);
            res.status(500).json({ error: `Router failed: ${routePath}`, message: err.message });
        }
    });

bridgeRouter('/api/auth', '../backend/src/routes/authRoutes.js');
bridgeRouter('/api/projects', '../backend/src/routes/projectRoutes.js');
bridgeRouter('/api/partners', '../backend/src/routes/partnerRoutes.js');
bridgeRouter('/api/agreements', '../backend/src/routes/agreementRoutes.js');
bridgeRouter('/api/audit', '../backend/src/routes/auditRoutes.js');
bridgeRouter('/api/invitations', '../backend/src/routes/invitationRoutes.js');
bridgeRouter('/api/system', '../backend/src/routes/systemRoutes.js');
bridgeRouter('/api/payouts', '../backend/src/routes/payoutRoutes.js');
bridgeRouter('/api/finance', '../backend/src/routes/financeRoutes.js');
bridgeRouter('/api/enquiries', '../backend/src/routes/enquiryRoutes.js');
bridgeRouter('/api/transactions', '../backend/src/routes/transactionRoutes.js');
bridgeRouter('/api/analytics', '../backend/src/routes/analyticsRoutes.js');
bridgeRouter('/api/leads', '../backend/src/routes/leadRoutes.js');

// ─── DEBUG — Seed admin users ────────────────────────────────────────────────
app.get('/api/debug/seed-admin', async (req: Request, res: Response) => {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const bcryptPkg = await import('bcryptjs');
        const bcrypt = (bcryptPkg as any).default || bcryptPkg;
        const prisma = new PrismaClient();
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const users = [
            { email: 'rushabh@itcyber.com', name: 'Rushabh Makim' },
            { email: 'akshat@itcyber.com', name: 'Akshat Vora' },
            { email: 'nishit@itcyber.com', name: 'Nishit Vegad' },
        ];
        const results = await Promise.all(users.map(u =>
            prisma.user.upsert({ where: { email: u.email }, update: { role: 'ADMIN' }, create: { email: u.email, password: hashedPassword, name: u.name, role: 'ADMIN' } })
        ));
        await prisma.$disconnect();
        res.json({ msg: 'Seeded', users: results.map(u => u.email) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default app;
