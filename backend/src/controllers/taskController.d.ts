import type { Request, Response, NextFunction } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
export declare const createTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTasksByProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addTaskComment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTaskComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map