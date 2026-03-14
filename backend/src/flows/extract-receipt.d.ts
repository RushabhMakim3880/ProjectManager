import { z } from 'zod';
export declare const ReceiptExtractionSchema: z.ZodObject<{
    merchantName: z.ZodString;
    date: z.ZodString;
    totalAmount: z.ZodNumber;
    currency: z.ZodString;
    category: z.ZodString;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        quantity: z.ZodOptional<z.ZodNumber>;
        price: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }, {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }>, "many">>;
    taxAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    category: string;
    date: string;
    merchantName: string;
    totalAmount: number;
    currency: string;
    items?: {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }[] | undefined;
    taxAmount?: number | undefined;
}, {
    category: string;
    date: string;
    merchantName: string;
    totalAmount: number;
    currency: string;
    items?: {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }[] | undefined;
    taxAmount?: number | undefined;
}>;
export declare const extractReceiptFlow: import("genkit").Action<z.ZodObject<{
    fileBuffer: z.ZodString;
    fileType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fileBuffer: string;
    fileType: string;
}, {
    fileBuffer: string;
    fileType: string;
}>, z.ZodObject<{
    merchantName: z.ZodString;
    date: z.ZodString;
    totalAmount: z.ZodNumber;
    currency: z.ZodString;
    category: z.ZodString;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        quantity: z.ZodOptional<z.ZodNumber>;
        price: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }, {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }>, "many">>;
    taxAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    category: string;
    date: string;
    merchantName: string;
    totalAmount: number;
    currency: string;
    items?: {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }[] | undefined;
    taxAmount?: number | undefined;
}, {
    category: string;
    date: string;
    merchantName: string;
    totalAmount: number;
    currency: string;
    items?: {
        name: string;
        quantity?: number | undefined;
        price?: number | undefined;
    }[] | undefined;
    taxAmount?: number | undefined;
}>, z.ZodTypeAny>;
//# sourceMappingURL=extract-receipt.d.ts.map