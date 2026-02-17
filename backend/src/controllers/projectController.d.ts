import type { Request, Response, NextFunction } from 'express';
export declare const createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProjects: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProjectById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const lockProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=projectController.d.ts.map