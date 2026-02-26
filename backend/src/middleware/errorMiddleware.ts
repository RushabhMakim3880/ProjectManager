export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

import type { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            stack: err.stack,
            error: err
        });
    }

    // Production: Don't leak implementation details
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Handle Multer specific errors (like LIMIT_FILE_SIZE, LIMIT_UNEXPECTED_FILE)
    if (err.code && typeof err.code === 'string' && err.code.startsWith('LIMIT_')) {
        return res.status(400).json({
            status: 'error',
            message: `File upload error: ${err.message}. ${err.code === 'LIMIT_UNEXPECTED_FILE' ? 'You might be uploading too many files at once (Limit: 20).' : ''}`
        });
    }

    // Diagnostic production error (Temporary for debugging Vercel 500s)
    console.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
        diagnostic: {
            message: err.message,
            code: err.code || 'UNKNOWN_CODE',
            path: req.path
        }
    });
};
