import type { Request, Response, NextFunction } from 'express';
export declare const createEnquiry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEnquiries: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEnquiryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEnquiry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEnquiry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const convertEnquiryToProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPublicEnquiry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const submitDiscoveryForm: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createQuotation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuotations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProposal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProposals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const extractDiscovery: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProposal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const signProposal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateDraftEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=enquiryController.d.ts.map