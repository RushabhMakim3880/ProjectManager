import { z } from 'zod';
export declare const extractDiscoveryFlow: import("genkit").Action<z.ZodObject<{
    fileBuffer: z.ZodString;
    fileType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fileBuffer: string;
    fileType: string;
}, {
    fileBuffer: string;
    fileType: string;
}>, z.ZodObject<{
    projectGoals: z.ZodString;
    websiteStructure: z.ZodString;
    brandIdentity: z.ZodOptional<z.ZodObject<{
        colors: z.ZodString;
        fonts: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        colors: string;
        fonts: string;
    }, {
        colors: string;
        fonts: string;
    }>>;
    assets: z.ZodOptional<z.ZodObject<{
        logosAvailable: z.ZodBoolean;
        imagesProvided: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        logosAvailable: boolean;
        imagesProvided: boolean;
    }, {
        logosAvailable: boolean;
        imagesProvided: boolean;
    }>>;
    keyFeatures: z.ZodArray<z.ZodString, "many">;
    competitors: z.ZodString;
    budgetRange: z.ZodString;
    timeline: z.ZodString;
    technicalRequirements: z.ZodString;
    rawSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectGoals: string;
    websiteStructure: string;
    keyFeatures: string[];
    competitors: string;
    budgetRange: string;
    timeline: string;
    technicalRequirements: string;
    rawSummary: string;
    brandIdentity?: {
        colors: string;
        fonts: string;
    } | undefined;
    assets?: {
        logosAvailable: boolean;
        imagesProvided: boolean;
    } | undefined;
}, {
    projectGoals: string;
    websiteStructure: string;
    keyFeatures: string[];
    competitors: string;
    budgetRange: string;
    timeline: string;
    technicalRequirements: string;
    rawSummary: string;
    brandIdentity?: {
        colors: string;
        fonts: string;
    } | undefined;
    assets?: {
        logosAvailable: boolean;
        imagesProvided: boolean;
    } | undefined;
}>, z.ZodTypeAny>;
//# sourceMappingURL=extract-discovery.d.ts.map