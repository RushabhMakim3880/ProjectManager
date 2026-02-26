import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const file = req.file;

        if (!file) {
            return next(new AppError('No file uploaded', 400));
        }

        const document = await prisma.projectDocument.create({
            data: {
                projectId,
                name: file.originalname,
                fileKey: file.filename,
                mimeType: file.mimetype,
                size: file.size,
                uploadedById: (req as any).user.id,
            },
        });

        res.status(201).json(document);
    } catch (error: any) {
        next(error);
    }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const documents = await prisma.projectDocument.findMany({
            where: { projectId },
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(documents);
    } catch (error: any) {
        next(error);
    }
};

export const downloadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const document = await prisma.projectDocument.findUnique({
            where: { id },
        });

        if (!document) {
            return next(new AppError('Document not found', 404));
        }

        const filePath = path.join(__dirname, '../../uploads/documents', document.fileKey);

        if (!fs.existsSync(filePath)) {
            return next(new AppError('File not found on server', 404));
        }

        res.download(filePath, document.name);
    } catch (error: any) {
        next(error);
    }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const document = await prisma.projectDocument.findUnique({
            where: { id },
        });

        if (!document) {
            return next(new AppError('Document not found', 404));
        }

        const filePath = path.join(__dirname, '../../uploads/documents', document.fileKey);

        // Delete file from disk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete record from database
        await prisma.projectDocument.delete({
            where: { id },
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        next(error);
    }
};
