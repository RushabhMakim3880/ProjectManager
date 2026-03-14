import { z } from 'zod';
import { ai } from '../lib/genkit.js';
// Schema for the extracted data based on the RJ Group Questionnaire
const DiscoveryExtractionSchema = z.object({
    projectGoals: z.string().describe('Primary goal of the project as described in the questionnaire'),
    websiteStructure: z.string().describe('Detailed project structure/logistics info'),
    brandIdentity: z.object({
        colors: z.string().describe('Specific color codes or hex values'),
        fonts: z.string().describe('Specific fonts or typography preferences'),
    }).optional(),
    assets: z.object({
        logosAvailable: z.boolean(),
        imagesProvided: z.boolean(),
    }).optional(),
    keyFeatures: z.array(z.string()).describe('List of key features required for the website/app'),
    competitors: z.string().describe('Information about competitors or references'),
    budgetRange: z.string().describe('Mentioned budget or price range if any'),
    timeline: z.string().describe('Expected project duration or deadline'),
    technicalRequirements: z.string().describe('Domain, hosting, or third-party integration needs'),
    rawSummary: z.string().describe('A markdown summary of all other extracted details not fitting exactly in the above fields'),
});
export const extractDiscoveryFlow = ai.defineFlow({
    name: 'extractDiscoveryFlow',
    inputSchema: z.object({
        fileBuffer: z.string().describe('Base64 encoded file content'),
        fileType: z.string().describe('MIME type of the file'),
    }),
    outputSchema: DiscoveryExtractionSchema,
}, async (input) => {
    const response = await ai.generate({
        prompt: [
            {
                text: `You are an expert project discovery assistant. 
          Extract structured data from the provided questionnaire. 
          Focus on identifying project goals, technical requirements, brand details, and feature sets.
          If a field is not present, leave it empty.
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
        throw new Error('Failed to extract structured data from questionnaire');
    }
    return response.output;
});
//# sourceMappingURL=extract-discovery.js.map