import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';
import fs from 'fs';
import { extractDiscoveryFlow } from '../flows/extract-discovery.js';
import { generateColdEmailFlow } from '../flows/generate-cold-email.js';

export const createEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { clientName, companyName, email, phone, country, servicesRequested, projectDescription, budgetRange, timeline, discoverySource } = req.body;

        // Generate formatted enquiry ID: ENQ-YYYY-NNN
        const date = new Date();
        const year = date.getFullYear();
        const count = await prisma.enquiry.count({
            where: {
                createdAt: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                }
            }
        });
        const enquiryId = `ENQ-${year}-${String(count + 1).padStart(3, '0')}`;

        const enquiry = await prisma.enquiry.create({
            data: {
                enquiryId,
                clientName,
                companyName,
                email,
                phone,
                country,
                servicesRequested: JSON.stringify(servicesRequested || []),
                discoveryData: JSON.stringify({
                    projectDescription: projectDescription || '',
                    budgetRange: budgetRange || '',
                    timeline: timeline || '',
                    discoverySource: discoverySource || ''
                }),
            }
        });

        res.status(201).json(enquiry);
    } catch (error) {
        next(error);
    }
};

export const getEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enquiries = await prisma.enquiry.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Parse JSON fields
        const parsed = enquiries.map((e: any) => ({
            ...e,
            servicesRequested: JSON.parse(e.servicesRequested || '[]'),
            discoveryData: e.discoveryData ? JSON.parse(e.discoveryData) : null
        }));

        res.json(parsed);
    } catch (error) {
        next(error);
    }
};

export const getEnquiryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const enquiry = await prisma.enquiry.findUnique({
            where: { id },
            include: {
                notes: {
                    include: {
                        user: {
                            select: { name: true, displayName: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        res.json({
            ...enquiry,
            servicesRequested: JSON.parse(enquiry.servicesRequested || '[]'),
            discoveryData: enquiry.discoveryData ? JSON.parse(enquiry.discoveryData) : null
        });
    } catch (error) {
        next(error);
    }
};

export const updateEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        if (data.servicesRequested && typeof data.servicesRequested !== 'string') {
            data.servicesRequested = JSON.stringify(data.servicesRequested);
        }
        if (data.discoveryData && typeof data.discoveryData !== 'string') {
            data.discoveryData = JSON.stringify(data.discoveryData);
        }

        // Ensure numerical types are correct
        if (data.estimatedValue !== undefined) data.estimatedValue = parseFloat(data.estimatedValue);
        if (data.probability !== undefined) data.probability = parseInt(data.probability);

        const enquiry = await prisma.enquiry.update({
            where: { id },
            data,
        });

        res.json({
            ...enquiry,
            servicesRequested: JSON.parse(enquiry.servicesRequested || '[]'),
            discoveryData: enquiry.discoveryData ? JSON.parse(enquiry.discoveryData) : null
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const enquiry = await prisma.enquiry.findUnique({
            where: { id }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        if (enquiry.projectId) {
            return next(new AppError('Cannot delete an enquiry that has already been converted to a project.', 400));
        }

        await prisma.enquiry.delete({
            where: { id }
        });

        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const convertEnquiryToProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const enquiry = await prisma.enquiry.findUnique({
            where: { id }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        if (enquiry.projectId) {
            return next(new AppError('Enquiry already converted to project', 400));
        }

        const discoveryData = enquiry.discoveryData ? JSON.parse(enquiry.discoveryData) : {};

        // 1. Create Project
        const project = await prisma.project.create({
            data: {
                name: enquiry.companyName || `${enquiry.clientName}'s Project`,
                clientName: enquiry.clientName,
                clientEmail: enquiry.email,
                clientPhone: enquiry.phone,
                totalValue: enquiry.estimatedValue || 0,
                startDate: new Date(),
                status: 'ACTIVE',
                description: discoveryData.projectDescription || '',
                weights: JSON.stringify({ DEVELOPMENT: 100 }), // Default
            }
        });

        // 2. Link Enquiry to Project
        await prisma.enquiry.update({
            where: { id },
            data: {
                projectId: project.id,
                stage: 'APPROVED'
            }
        });

        res.json({ message: 'Converted to project successfully', projectId: project.id });
    } catch (error) {
        next(error);
    }
};

export const getPublicEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    // ... (rest of the file)
    try {
        const { id } = req.params;
        const enquiry = await prisma.enquiry.findUnique({
            where: { id }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        // Only return non-sensitive fields needed for discovery
        res.json({
            id: enquiry.id,
            clientName: enquiry.clientName,
            companyName: enquiry.companyName,
            servicesRequested: JSON.parse(enquiry.servicesRequested || '[]'),
            stage: enquiry.stage
        });
    } catch (error) {
        next(error);
    }
};

export const submitDiscoveryForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const discoveryData = req.body;

        const enquiry = await prisma.enquiry.findUnique({
            where: { id }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        const updatedEnquiry = await prisma.enquiry.update({
            where: { id },
            data: {
                discoveryData: JSON.stringify(discoveryData),
                stage: 'DISCOVERY_SUBMITTED' // Automatically advance stage
            }
        });

        res.json({
            ...updatedEnquiry,
            servicesRequested: JSON.parse(updatedEnquiry.servicesRequested || '[]'),
            discoveryData: updatedEnquiry.discoveryData ? JSON.parse(updatedEnquiry.discoveryData) : null
        });
    } catch (error) {
        next(error);
    }
};
export const createQuotation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, items, subtotal, tax, discount, total, validUntil, currency, optionalItems } = req.body;

        const quotation = await prisma.quotation.create({
            data: {
                enquiryId: id,
                title: title || `Quotation for ${id}`,
                totalAmount: parseFloat(total) || 0,
                taxAmount: parseFloat(tax) || 0,
                subtotal: parseFloat(subtotal) || 0,
                discount: parseFloat(discount) || 0,
                currency: currency || 'USD',
                validUntil: validUntil ? new Date(validUntil) : null,
                lineItems: JSON.stringify(items || []),
                optionalItems: JSON.stringify(optionalItems || []),
                status: 'DRAFT'
            }
        });

        res.status(201).json(quotation);
    } catch (error) {
        next(error);
    }
};

export const getQuotations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const quotations = await prisma.quotation.findMany({
            where: { enquiryId: id },
            orderBy: { createdAt: 'desc' }
        });

        const parsed = quotations.map((q: any) => ({
            ...q,
            lineItems: JSON.parse(q.lineItems || '[]'),
            optionalItems: JSON.parse(q.optionalItems || '[]')
        }));

        res.json(parsed);
    } catch (error) {
        next(error);
    }
};

export const createProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, content, status } = req.body; // content is the sections array

        const proposal = await prisma.proposal.create({
            data: {
                enquiryId: id,
                title: title || `Proposal for ${id}`,
                content: JSON.stringify(content || []),
                status: status || 'DRAFT'
            }
        });

        res.status(201).json(proposal);
    } catch (error) {
        next(error);
    }
};

export const getProposals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const proposals = await prisma.proposal.findMany({
            where: { enquiryId: id },
            orderBy: { createdAt: 'desc' }
        });

        const parsed = proposals.map((p: any) => ({
            ...p,
            content: JSON.parse(p.content || '[]')
        }));

        res.json(parsed);
    } catch (error) {
        next(error);
    }
};

export const extractDiscovery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return next(new AppError('No file uploaded', 400));
        }

        const enquiry = await prisma.enquiry.findUnique({
            where: { id }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        // 1. Read file and convert to base64
        const fileBuffer = fs.readFileSync(file.path);
        const base64Content = fileBuffer.toString('base64');

        // 2. Call Genkit Flow
        const extractedData = await extractDiscoveryFlow({
            fileBuffer: base64Content,
            fileType: file.mimetype
        });

        // 3. Update Enquiry
        const updatedEnquiry = await prisma.enquiry.update({
            where: { id },
            data: {
                discoveryData: JSON.stringify(extractedData),
                stage: enquiry.stage === 'NEW' ? 'DISCOVERY_IN_PROGRESS' : enquiry.stage
            }
        });

        // 4. Optionally create a note for tracking
        await prisma.enquiryNote.create({
            data: {
                enquiryId: id,
                content: `AI Discovery Extraction completed. Extracted goals: ${String(extractedData.projectGoals).substring(0, 100)}...`,
                userId: (req as any).user?.userId || '' // Assuming auth middleware attaches user
            }
        });

        res.json({
            message: 'Discovery data extracted successfully',
            discoveryData: extractedData
        });

        // Cleanup: remove uploaded file after processing
        fs.unlinkSync(file.path);

    } catch (error) {
        console.error('AI Extraction Error:', error);
        next(new AppError('Failed to extract data from questionnaire', 500));
    }
};

export const updateProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { proposalId } = req.params;
        const { title, content, status } = req.body;

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId }
        });

        if (!proposal) {
            return next(new AppError('Proposal not found', 404));
        }

        if (proposal.status === 'SIGNED') {
            return next(new AppError('Cannot update a signed proposal', 400));
        }

        const updated = await prisma.proposal.update({
            where: { id: proposalId },
            data: {
                title: title || proposal.title,
                content: content ? JSON.stringify(content) : proposal.content,
                status: status || proposal.status
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const signProposal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { proposalId } = req.params;
        const { signature, signedBy } = req.body;

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId }
        });

        if (!proposal) {
            return next(new AppError('Proposal not found', 404));
        }

        if (proposal.status === 'SIGNED') {
            return next(new AppError('Proposal is already signed', 400));
        }

        const updated = await prisma.proposal.update({
            where: { id: proposalId },
            data: {
                signature,
                signedBy,
                signedAt: new Date(),
                status: 'SIGNED'
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const generateDraftEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const enquiry = await prisma.enquiry.findUnique({
            where: { id }
        });

        if (!enquiry) {
            return next(new AppError('Enquiry not found', 404));
        }

        const discoveryData = enquiry.discoveryData ? JSON.parse(enquiry.discoveryData) : {};
        const servicesRequested = JSON.parse(enquiry.servicesRequested || '[]');

        const draft = await generateColdEmailFlow({
            template: enquiry.emailTemplate || '',
            subject: enquiry.emailSubject || '',
            lead: {
                companyName: enquiry.companyName || '',
                clientName: enquiry.clientName as string,
                industry: enquiry.industry || '',
                servicesRequested: enquiry.servicesRequested || '',
                website: enquiry.website || '',
            },
            senderName: (req as any).user?.displayName || (req as any).user?.name || 'Managing Director'
        });

        res.json(draft);
    } catch (error) {
        console.error('Email Generation Error:', error);
        next(new AppError('Failed to generate email draft', 500));
    }
};
