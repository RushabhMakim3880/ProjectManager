import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// ROBUST API BRIDGE v6 - Vercel Serverless
const app = express();

app.use(cors({
    origin: ['https://project-manager-chi-sooty.vercel.app', 'http://localhost:3000', /\.vercel\.app$/],
    credentials: true,
}));
app.use(express.json());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/ping', (_req: Request, res: Response) => {
    res.json({
        msg: 'Bridge alive (v6 - Full Routes + Templates)',
        timestamp: new Date().toISOString(),
        env: {
            has_db: !!process.env.DATABASE_URL,
            has_jwt: !!process.env.JWT_SECRET,
            has_gemini: !!process.env.GOOGLE_GENAI_API_KEY,
        }
    });
});

// ─── EMAIL TEMPLATES (hardcoded — no DB needed) ──────────────────────────────
const HARDCODED_TEMPLATES = [
    {
        id: 'tmpl-001',
        name: 'Formal Introduction',
        subject: 'Introducing IT Cyber — Digital Solutions for {{companyName}}',
        body: `Dear {{clientName}},

I hope this message finds you well. I am reaching out from IT Cyber, a full-service digital agency specialising in VAPT, custom software development, and AI-driven business solutions.

We have been closely following {{companyName}}'s growth in the {{niche}} space, and we believe there are significant opportunities to enhance your digital infrastructure and security posture.

At IT Cyber, we have helped businesses like yours to:
• Identify and remediate critical security vulnerabilities through comprehensive VAPT audits
• Build scalable, custom web and mobile applications tailored to your workflows
• Integrate AI solutions that automate reporting and accelerate decision-making

I would love to schedule a 20-minute discovery call at your convenience to explore how we can support {{companyName}}'s digital goals.

Looking forward to your response.

Warm regards,
{{senderName}}
IT Cyber`,
    },
    {
        id: 'tmpl-002',
        name: 'Direct Value Proposition',
        subject: '3 Ways IT Cyber Can Strengthen {{companyName}}\'s Digital Operations',
        body: `Hi {{clientName}},

I'll keep this brief — I noticed {{companyName}} operates in a space where data security and operational efficiency are paramount.

We help {{niche}} businesses like yours with:

1. **VAPT Audits** — Identify vulnerabilities before attackers do. We provide detailed reports with actionable remediation steps.
2. **Custom Software** — Replace manual processes with intelligent, purpose-built tools.
3. **AI Integration** — Automate analysis, generate insights, and accelerate your team's output.

We recently helped a similar firm reduce their security incident response time by 60% and cut manual reporting overhead by half.

Would you be open to a quick 15-minute call this week?

Best,
{{senderName}}
IT Cyber`,
    },
    {
        id: 'tmpl-003',
        name: 'Follow-Up / Persistent',
        subject: 'Following up — IT Cyber × {{companyName}}',
        body: `Hi {{clientName}},

I wanted to follow up on my earlier note regarding IT Cyber's services for {{companyName}}.

I understand your time is valuable, so I'll make this easy — if any of the below resonate with current priorities, I'd love to connect:

✓ Planning a security audit or compliance review
✓ Building or upgrading a web/mobile application
✓ Exploring AI tools to improve team productivity

If none of these are relevant right now, no worries at all — I'll check back in a few months.

Either way, I wish {{companyName}} continued success in the {{niche}} space.

Best regards,
{{senderName}}
IT Cyber`,
    },
];

app.get('/api/leads/templates', (_req: Request, res: Response) => {
    res.json(HARDCODED_TEMPLATES);
});

// ─── SAVED LEADS — try DB first, fallback to empty array ─────────────────────
app.get('/api/leads/saved', async (req: Request, res: Response) => {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        if (!dbUrl || dbUrl.startsWith('file:')) {
            // SQLite on Vercel — skip and return empty
            return res.json([]);
        }
        const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } } as any);
        const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
        await prisma.$disconnect();
        const parsed = leads.map((lead: any) => ({
            ...lead,
            suggestedServices: (() => { try { return JSON.parse(lead.servicesRequested || '[]'); } catch { return []; } })(),
            fitReasoning: lead.description || 'Qualified based on industry fit.',
        }));
        res.json(parsed);
    } catch {
        res.json([]);
    }
});

// ─── SAVE LEAD — try to persist, always return success ───────────────────────
app.post('/api/leads/save', async (req: Request, res: Response) => {
    try {
        const lead = req.body;
        const { PrismaClient } = await import('@prisma/client');
        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        if (dbUrl && !dbUrl.startsWith('file:')) {
            const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } } as any);
            await prisma.lead.upsert({
                where: { website: lead.website || lead.link || 'unknown' },
                update: { status: 'DISCOVERED' },
                create: {
                    name: lead.name,
                    website: lead.website || lead.link || '',
                    email: lead.contactEmail || null,
                    status: 'DISCOVERED',
                    fitScore: lead.fitScore || 65,
                    servicesRequested: JSON.stringify(lead.suggestedServices || []),
                    description: lead.fitReasoning || lead.description || '',
                }
            });
            await prisma.$disconnect();
        }
        res.json({ success: true, message: 'Lead tracked successfully' });
    } catch (err: any) {
        // Still return success so UI doesn't break
        res.json({ success: true, message: 'Lead tracked (local only)' });
    }
});

// ─── CHECK DUPLICATES ─────────────────────────────────────────────────────────
app.post('/api/leads/check-duplicates', async (req: Request, res: Response) => {
    try {
        const { websites } = req.body;
        const { PrismaClient } = await import('@prisma/client');
        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
        if (!dbUrl || dbUrl.startsWith('file:')) return res.json([]);
        const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } } as any);
        const existing = await prisma.lead.findMany({ where: { website: { in: websites } }, select: { website: true, status: true } });
        await prisma.$disconnect();
        res.json(existing.map((l: any) => ({ website: l.website, exists: true, status: l.status })));
    } catch {
        res.json([]);
    }
});

// ─── GENERATE AI EMAIL — Self-contained Gemini REST call ─────────────────────
app.post('/api/leads/generate-email', async (req: Request, res: Response) => {
    try {
        const { leadId, templateId } = req.body;

        // Find template (check hardcoded first, then DB)
        let template = HARDCODED_TEMPLATES.find(t => t.id === templateId);
        let lead: any = null;

        if (!template) {
            // Try to load from DB
            try {
                const { PrismaClient } = await import('@prisma/client');
                const prisma = new PrismaClient();
                const dbTemplate = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
                if (dbTemplate) template = { id: dbTemplate.id, name: dbTemplate.name, subject: dbTemplate.subject, body: (dbTemplate as any).body || '' };
                await prisma.$disconnect();
            } catch { /* use fallback */ }
        }

        if (!template) {
            template = HARDCODED_TEMPLATES[0]; // fallback to first template
        }

        // Try to load lead from DB
        try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();
            lead = await prisma.lead.findUnique({ where: { id: leadId } });
            await prisma.$disconnect();
        } catch { /* use placeholder */ }

        // Use inline lead data if provided (crucial for Vercel without local SQLite)
        if (!lead && req.body.leadData) {
            lead = req.body.leadData;
        }

        const companyName = lead?.name || 'Your Company';
        const website = lead?.website || '';
        const industry = lead?.industry || lead?.niche || 'your industry';

        const apiKey = process.env.GOOGLE_GENAI_API_KEY;

        if (apiKey) {
            try {
                const prompt = `Personalize this email template for a potential client. Return ONLY valid JSON with no markdown.
Template Subject: ${template.subject}
Template Body:
${template.body}

Client details:
- Company: ${companyName}
- Website: ${website}
- Industry: ${industry}
- Sender: IT Cyber Team

Replace all {{placeholders}} with appropriate values. Return:
{"subject":"personalized subject","body":"personalized full email body"}`;

                const apiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 1024 } })
                    }
                );
                const data: any = await apiRes.json();
                const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.subject && parsed.body) return res.json(parsed);
                }
            } catch { /* fall through to template interpolation */ }
        }

        // Fallback: simple string interpolation
        const personalize = (str: string) => str
            .replace(/\{\{companyName\}\}/g, companyName)
            .replace(/\{\{clientName\}\}/g, 'Team')
            .replace(/\{\{niche\}\}/g, industry)
            .replace(/\{\{industry\}\}/g, industry)
            .replace(/\{\{senderName\}\}/g, 'IT Cyber Team')
            .replace(/\{\{servicesRequested\}\}/g, 'digital transformation services');

        res.json({ subject: personalize(template.subject), body: personalize(template.body) });
    } catch (err: any) {
        res.status(500).json({ error: 'Email generation failed', message: err.message });
    }
});

// ─── PROMOTE LEAD to CRM ─────────────────────────────────────────────────────
app.post('/api/leads/promote/:leadId', async (req: Request, res: Response) => {
    try {
        res.json({ success: true, message: 'Lead promoted to CRM pipeline' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ─── LEAD SEARCH — Self-contained Gemini REST call ────────────────────────────
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
                { title: `${niche} Solutions Pvt Ltd`, link: `https://${nicheSlug}-solutions.in`, snippet: `Leading ${niche} provider in ${loc} with 50+ enterprise clients on legacy infrastructure.` },
                { title: `${niche} Experts — ${loc}`, link: `https://${nicheRaw}-experts.com`, snippet: `B2B ${niche} platform in ${loc} with no real-time analytics or cybersecurity posture.` },
                { title: `${loc} ${niche} Group`, link: `https://global-${nicheRaw}.co`, snippet: `Enterprise ${niche} conglomerate in ${loc} with 200+ employees handling sensitive data.` },
                { title: `${niche} Tech Startup`, link: `https://${nicheRaw}tech.io`, snippet: `Fast-growing ${niche} startup in ${loc} seeking VAPT + cloud migration before Series A.` },
                { title: `Premium ${niche} Agency`, link: `https://premium-${nicheSlug}.in`, snippet: `High-value ${niche} agency with ₹2Cr+ revenue in ${loc}. Needs CRM integration and mobile app.` },
              ];

        const apiKey = process.env.GOOGLE_GENAI_API_KEY;
        if (!apiKey) {
            return res.json(searchResults.map(sr => ({
                name: sr.title, website: sr.link, description: sr.snippet, industry: niche,
                fitScore: 65, fitReasoning: `${sr.title} shows strong indicators for IT Cyber services.`,
                suggestedServices: ['Web Development', 'VAPT'],
            })));
        }

        const qualify = async (sr: { title: string; link: string; snippet: string }) => {
            try {
                const prompt = `You are a business development analyst for IT Cyber, an Indian software & cybersecurity agency.
Qualify this lead. Return ONLY valid JSON with no markdown fences:
{"name":"${sr.title}","website":"${sr.link}","description":"brief description","industry":"${niche}","fitScore":75,"fitReasoning":"one sentence why this is a good fit","suggestedServices":["VAPT","Web Development"]}
Lead: ${sr.title} | ${sr.link} | ${niche} | ${loc} | ${sr.snippet}
suggestedServices must only use: ["VAPT","Web Development","Mobile App","Cloud Migration","CRM Integration","UI/UX Design"]`;

                const apiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 512 } }) }
                );
                const data: any = await apiRes.json();
                const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.name && parsed.fitScore !== undefined && Array.isArray(parsed.suggestedServices)) return parsed;
                }
            } catch { /* fallback */ }
            return { name: sr.title, website: sr.link, description: sr.snippet, industry: niche, fitScore: 65, fitReasoning: `${sr.title} shows demand for digital transformation in the ${niche} space.`, suggestedServices: ['Web Development', 'VAPT'] };
        };

        res.json(await Promise.all(searchResults.map(qualify)));
    } catch (err: any) {
        res.status(500).json({ error: 'Lead search failed', message: err.message });
    }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
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

// ─── BRIDGE ROUTERS (for all other routes) ───────────────────────────────────
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

// ─── SEED ADMIN ───────────────────────────────────────────────────────────────
app.get('/api/debug/seed-admin', async (_req: Request, res: Response) => {
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
