import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
export declare const searchLeads: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const checkExistingLeads: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const saveLead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLeads: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const promoteToEnquiry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const importLead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateAILeadEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendColdEmail: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=leadController.d.ts.map