import { z } from 'zod';
import { ai } from '../lib/genkit.js';
export const ReceiptExtractionSchema = z.object({
    merchantName: z.string().describe('Name of the store or merchant'),
    date: z.string().describe('Date on the receipt (ISO format preferred)'),
    totalAmount: z.number().describe('Total amount paid'),
    currency: z.string().describe('Currency code (e.g. INR, USD)'),
    category: z.string().describe('Expense category (e.g. TRAVEL, MEALS, SOFTWARE, OFFICE_SUPPLIES)'),
    items: z.array(z.object({
        name: z.string(),
        quantity: z.number().optional(),
        price: z.number().optional()
    })).optional().describe('Individual items listed on the receipt'),
    taxAmount: z.number().optional().describe('Total tax amount if specified'),
});
export const extractReceiptFlow = ai.defineFlow({
    name: 'extractReceiptFlow',
    inputSchema: z.object({
        fileBuffer: z.string().describe('Base64 encoded image content'),
        fileType: z.string().describe('MIME type of the image'),
    }),
    outputSchema: ReceiptExtractionSchema,
}, async (input) => {
    const response = await ai.generate({
        prompt: [
            {
                text: `You are an expert financial assistant. 
          Extract structured data from the provided receipt image. 
          Focus on identifying the merchant, total amount, currency, date, and category.
          Default to INR if currency is unclear but the context suggests India.
          Return ONLY valid JSON matching the requested schema.`,
            },
            {
                media: {
                    url: `data:${input.fileType};base64,${input.fileBuffer}`,
                    contentType: input.fileType,
                },
            },
        ],
    });
    if (!response.output) {
        throw new Error('Failed to extract structured data from receipt');
    }
    return response.output;
});
//# sourceMappingURL=extract-receipt.js.map