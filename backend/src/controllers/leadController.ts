import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { scrapeLeadsFlow } from '../flows/scrape-leads.js';
import { generateColdEmailFlow } from '../flows/generate-cold-email.js';
import { sendEmail } from '../services/emailService.js';
import { AppError } from '../middleware/errorMiddleware.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const searchLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { niche, location, manualUrls } = req.body;
        
        if (!niche) {
            throw new AppError('Niche is required', 400);
        }

        const leads = await scrapeLeadsFlow({ niche, location, manualUrls });
        res.json(leads);
    } catch (error) {
        next(error);
    }
};

export const checkExistingLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { websites } = req.body;
        if (!Array.isArray(websites)) {
            throw new AppError('Websites array is required', 400);
        }

        // Check Leads table
        const existingLeads = await prisma.lead.findMany({
            where: { website: { in: websites } },
            select: { website: true, status: true }
        });

        // Check Enquiries table (discoveryData JSON field contains website)
        // Since discoveryData is a string/json, we'll do a simple contains check for each or fetch all and filter
        // For performance, we'll fetch enquiries with AI_LEAD_HUNTER source
        const existingEnquiries = await prisma.enquiry.findMany({
            where: {
                discoveryData: { contains: 'AI_LEAD_HUNTER' }
            },
            select: { discoveryData: true }
        });

        const enquiryWebsites = existingEnquiries
            .map((e: any) => {
                try {
                    return JSON.parse(e.discoveryData || '{}').website;
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        const results = websites.map(url => {
            const lead = existingLeads.find((l: any) => l.website === url);
            const inEnquiry = enquiryWebsites.includes(url);
            
            if (inEnquiry) return { website: url, status: 'CONVERTED', exists: true };
            if (lead) return { website: url, status: lead.status, exists: true };
            return { website: url, exists: false };
        });

        res.json(results);
    } catch (error) {
        next(error);
    }
};

export const saveLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, website, industry, description, suggestedServices, fitScore } = req.body;
        const userId = req.user?.userId;

        if (!userId) throw new AppError('User not authenticated', 401);

        // Duplicate check
        const existingLead = await prisma.lead.findFirst({
            where: { website }
        });

        if (existingLead) {
            return res.json(existingLead);
        }

        const lead = await prisma.lead.create({
            data: {
                name,
                companyName: name,
                website,
                industry,
                description,
                servicesRequested: JSON.stringify(suggestedServices),
                fitScore,
                status: 'DISCOVERED',
                discoveredById: userId
            }
        });

        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
};

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                discoveredBy: { select: { name: true } }
            }
        });
        // Parse JSON string fields so frontend receives proper types
        const parsedLeads = leads.map((lead: any) => ({
            ...lead,
            suggestedServices: (() => {
                try { return JSON.parse(lead.servicesRequested || '[]'); } catch { return []; }
            })(),
            fitReasoning: lead.description || 'Qualified based on industry fit and digital presence analysis.',
        }));
        res.json(parsedLeads);
    } catch (error) {
        next(error);
    }
};

export const promoteToEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const lead = await prisma.lead.findUnique({
            where: { id }
        });

        if (!lead) throw new AppError('Lead not found', 404);

        // Generate a unique Enquiry ID
        const date = new Date();
        const year = date.getFullYear();
        const count = await prisma.enquiry.count();
        const enquiryId = `ENQ-${year}-${(count + 1).toString().padStart(3, '0')}`;

        const enquiry = await prisma.enquiry.create({
            data: {
                enquiryId,
                clientName: lead.name,
                companyName: lead.companyName,
                servicesRequested: lead.servicesRequested,
                discoveryData: JSON.stringify({
                    website: lead.website,
                    industry: lead.industry,
                    description: lead.description,
                    fitScore: lead.fitScore,
                    source: 'AI_LEAD_HUNTER',
                    leadId: lead.id
                }),
                stage: 'NEW',
                probability: Math.floor(lead.fitScore / 2)
            }
        });

        await prisma.lead.update({
            where: { id: lead.id },
            data: { 
                status: 'CONVERTED',
                enquiryId: enquiry.id
            }
        });

        res.status(201).json(enquiry);
    } catch (error) {
        next(error);
    }
};

export const importLead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, website, industry, description, suggestedServices, fitScore } = req.body;

        // Generate a unique Enquiry ID
        const date = new Date();
        const year = date.getFullYear();
        const count = await prisma.enquiry.count();
        const enquiryId = `ENQ-${year}-${(count + 1).toString().padStart(3, '0')}`;

        const enquiry = await prisma.enquiry.create({
            data: {
                enquiryId,
                clientName: name,
                companyName: name,
                servicesRequested: JSON.stringify(suggestedServices),
                discoveryData: JSON.stringify({
                    website,
                    industry,
                    description,
                    fitScore,
                    source: 'AI_LEAD_HUNTER'
                }),
                stage: 'NEW',
                probability: Math.floor(fitScore / 2) // Rough initial probability
            }
        });

        res.status(201).json(enquiry);
    } catch (error) {
        next(error);
    }
};

export const generateAILeadEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { leadId, templateId, senderName } = req.body;
        
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });

        if (!lead || !template) throw new AppError('Lead or template not found', 404);

        const email = await generateColdEmailFlow({
            template: template.body,
            subject: template.subject,
            lead: {
                companyName: lead.companyName,
                clientName: lead.name,
                industry: lead.industry || 'Business',
                servicesRequested: lead.servicesRequested ? JSON.parse(lead.servicesRequested).join(', ') : 'Digital transformation',
                website: lead.website
            },
            senderName
        });

        res.json(email);
    } catch (error) {
        next(error);
    }
};

export const sendColdEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { leadId, subject, body, toEmail } = req.body;
        const userId = req.user?.userId;

        if (!userId) throw new AppError('User not authenticated', 401);

        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) throw new AppError('Lead not found', 404);

        // In a real scenario, we'd use toEmail if the lead has one. 
        // For this demo/flow, we'll use the provided toEmail or a placeholder.
        const recipient = toEmail || 'placeholder@example.com';

        await sendEmail(
            recipient,
            subject,
            body.replace(/\n/g, '<br>')
        );

        // Update lead status
        await prisma.lead.update({
            where: { id: leadId },
            data: {
                status: 'CONTACTED',
                lastContactedAt: new Date()
            }
        });

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        next(error);
    }
};
