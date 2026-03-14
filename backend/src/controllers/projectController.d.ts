import type { Request, Response, NextFunction } from 'express';
import { type AuthRequest } from '../middleware/authMiddleware.js';
export declare const createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProjects: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProjectById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const lockProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const unlockProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map