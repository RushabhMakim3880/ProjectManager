import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared logic for upload directory path
const getUploadDir = () => {
    return process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '../../uploads/documents');
};

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const files = req.files as Express.Multer.File[];

        console.log('UPLOAD_DOCUMENTS_REQUEST:', { projectId, fileCount: files?.length });

        if (!files || files.length === 0) {
            return next(new AppError('No files uploaded', 400));
        }

        const documents = await Promise.all(
            files.map(file =>
                prisma.projectDocument.create({
                    data: {
                        projectId,
                        name: file.originalname,
                        fileKey: file.filename,
                        mimeType: file.mimetype,
                        size: file.size,
                        uploadedById: (req as any).user.userId,
                    },
                })
            )
        );

        console.log('UPLOAD_DOCUMENTS_SUCCESS:', { count: documents.length });
        res.status(201).json(documents);
    } catch (error: any) {
        console.error('UPLOAD_DOCUMENTS_ERROR:', error);
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

        const filePath = path.join(getUploadDir(), document.fileKey);

        console.log('DOWNLOAD_DOCUMENT_PATH:', { id, filePath, exists: fs.existsSync(filePath) });

        if (!fs.existsSync(filePath)) {
            return next(new AppError('File not found on server (it may have been cleared from ephemeral storage)', 404));
        }

        res.download(filePath, document.name);
    } catch (error: any) {
        console.error('DOWNLOAD_DOCUMENT_ERROR:', error);
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

        const filePath = path.join(getUploadDir(), document.fileKey);

        console.log('DELETE_DOCUMENT_PATH:', { id, filePath });

        // Delete file from disk
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('FILE_DELETE_ERROR:', err);
                // Continue with DB deletion even if file removal fails
            }
        }

        // Delete record from database
        await prisma.projectDocument.delete({
            where: { id },
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        console.error('DELETE_DOCUMENT_ERROR:', error);
        next(error);
    }
};
