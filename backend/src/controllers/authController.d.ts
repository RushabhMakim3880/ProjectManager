import type { Request, Response, NextFunction } from 'express';
export declare const signup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const me: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map