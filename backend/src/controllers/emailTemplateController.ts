import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Seed if empty
        if (templates.length === 0) {
            const seed = await seedTemplates();
            return res.json(seed);
        }

        res.json(templates);
    } catch (error) {
        next(error);
    }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, subject, body } = req.body;
        const template = await prisma.emailTemplate.create({
            data: { name, subject, body }
        });
        res.status(201).json(template);
    } catch (error) {
        next(error);
    }
};

export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, subject, body } = req.body;
        const template = await prisma.emailTemplate.update({
            where: { id },
            data: { name, subject, body }
        });
        res.json(template);
    } catch (error) {
        next(error);
    }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.emailTemplate.delete({ where: { id } });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

async function seedTemplates() {
    return await prisma.emailTemplate.createMany({
        data: [
            {
                name: 'Formal Introduction',
                subject: 'Strategic Partnership Inquiry: {{companyName}}',
                body: `Dear {{clientName}},

I hope this email finds you well.

I am writing to you on behalf of Stitch Digital. We have been monitoring the success of {{companyName}} in the {{industry}} sector and are highly impressed by your recent growth and market position.

We specialize in {{servicesRequested}}, and we believe our tailored solutions could significantly enhance your current operations and help you scale more effectively. Specifically, we have helped similar organizations achieve significant ROI through our specialized approach to digital transformation.

I have attached a brief overview of our services for your review. Would you be open to a brief 10-minute discovery call next week to explore how we can specifically support {{companyName}}'s goals for this quarter?

Best regards,
{{senderName}}
Principal Consultant, Stitch Digital`
            },
            {
                name: 'Technical Services Pitch',
                subject: 'Optimizing {{companyName}}\'s Technical Infrastructure',
                body: `Hi {{clientName}},

My name is {{senderName}} from Stitch Digital.

We recently reviewed {{companyName}}'s digital presence and identified several high-impact opportunities for optimization in {{servicesRequested}}. 

At Stitch Digital, we pride ourselves on delivering state-of-the-art technical excellence. We noticed that your company is currently at a pivotal stage of expansion, and we would love to discuss how our expertise in {{servicesRequested}} can provide you with the competitive edge needed in today's landscape.

Are you available for a quick chat on Tuesday or Wednesday?

Best,
{{senderName}}`
            }
        ]
    });
}
