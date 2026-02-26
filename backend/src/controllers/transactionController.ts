import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';
import { calculateFinancials } from '../services/contributionService.js';

export const getTransactions = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const transactions = await prisma.transaction.findMany({
            where: { projectId },
            orderBy: { date: 'desc' },
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
    const { projectId, amount, type, category, method, transactionId, description, date } = req.body;
    try {
        if (req.user?.role === 'PARTNER') {
            const partner = await prisma.partner.findUnique({
                where: { userId: req.user.id }
            });
            if (!partner?.canEditFinancials) {
                return res.status(403).json({ error: 'Partner does not have financial editing permissions' });
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                projectId,
                amount: parseFloat(amount),
                type,
                category,
                method,
                transactionId,
                description,
                date: date ? new Date(date) : new Date(),
            },
        });

        // Sync financials immediately
        await calculateFinancials(projectId);

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        if (req.user?.role === 'PARTNER') {
            const partner = await prisma.partner.findUnique({
                where: { userId: req.user.id }
            });
            if (!partner?.canEditFinancials) {
                return res.status(403).json({ error: 'Partner does not have financial editing permissions' });
            }
        }

        const transaction = await prisma.transaction.findUnique({ where: { id } });
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        await prisma.transaction.delete({
            where: { id },
        });

        // Sync financials immediately
        await calculateFinancials(transaction.projectId);

        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
