import type { Request, Response, NextFunction } from 'express';
export declare const getTemplates: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=emailTemplateController.d.ts.map