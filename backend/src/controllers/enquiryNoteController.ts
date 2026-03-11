import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const addEnquiryNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Enquiry ID
        const { content } = req.body;
        const userId = (req as any).user.userId;

        const note = await prisma.enquiryNote.create({
            data: {
                enquiryId: id,
                userId,
                content
            },
            include: {
                user: {
                    select: {
                        name: true,
                        displayName: true
                    }
                }
            }
        });

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

export const getEnquiryNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const notes = await prisma.enquiryNote.findMany({
            where: { enquiryId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        displayName: true
                    }
                }
            }
        });

        res.json(notes);
    } catch (error) {
        next(error);
    }
};

export const deleteEnquiryNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { noteId } = req.params;
        const userId = (req as any).user.userId;

        const note = await prisma.enquiryNote.findUnique({
            where: { id: noteId }
        });

        if (!note) {
            return next(new AppError('Note not found', 404));
        }

        // Only allow the creator or an admin to delete
        if (note.userId !== userId && (req as any).user.role !== 'ADMIN') {
            return next(new AppError('Unauthorized to delete this note', 403));
        }

        await prisma.enquiryNote.delete({
            where: { id: noteId }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
