import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { type AuthRequest } from '../middleware/authMiddleware.js';

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
    const { projectId, amount, type, method, transactionId, description, date } = req.body;
    try {
        const transaction = await prisma.transaction.create({
            data: {
                projectId,
                amount: parseFloat(amount),
                type,
                method,
                transactionId,
                description,
                date: date ? new Date(date) : new Date(),
            },
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.transaction.delete({
            where: { id },
        });
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
