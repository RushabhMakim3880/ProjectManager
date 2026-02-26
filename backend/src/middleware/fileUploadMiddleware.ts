import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp for Vercel, or local uploads for development
const baseDir = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '../../');
const uploadDir = path.join(baseDir, 'uploads/documents');

console.log('UPLOAD_DIR_CONFIG:', {
    baseDir,
    uploadDir,
    isVercel: !!process.env.VERCEL,
    env_node: process.env.NODE_ENV
});

// Ensure upload directory exists - Wrapped in try-catch for read-only environments like Vercel
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('CREATED_UPLOAD_DIR:', uploadDir);
    }
} catch (error) {
    if (process.env.VERCEL) {
        console.log('Note: Could not create upload directory on Vercel (read-only), but /tmp should be available.');
    } else {
        console.warn('Could not create upload directory:', error);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
