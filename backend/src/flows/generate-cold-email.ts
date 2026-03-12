import { z } from 'genkit';
import { ai } from '../lib/genkit.js';

export const generateColdEmailSchema = z.object({
  template: z.string(),
  subject: z.string(),
  lead: z.object({
    companyName: z.string(),
    clientName: z.string().optional().default('Team'),
    industry: z.string(),
    servicesRequested: z.string().optional().default('Digital solutions'),
    website: z.string(),
    linkedin: z.string().optional(),
    location: z.string().optional(),
  }),
  senderName: z.string().optional().default('Agency Partner'),
});

export const ColdEmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export const generateColdEmailFlow = ai.defineFlow(
  {
    name: 'generateColdEmail',
    inputSchema: generateColdEmailSchema,
    outputSchema: ColdEmailOutputSchema,
  },
  async (input) => {
    const { template, subject, lead, senderName } = input;

    const systemPrompt = `You are an expert cold email specialist. Your goal is to personalize a formal email template for a potential lead.
    
    Lead Info:
    - Company: ${lead.companyName}
    - Industry: ${lead.industry}
    - Website: ${lead.website}
    - Location: ${lead.location || 'Not specified'}
    
    Agency Info (Sender):
    - Name: ${senderName}
    - Services: Custom software development, AI integration, and digital marketing.

    Rules:
    1. Maintain the formal and professional tone of the provided template.
    2. Replace all placeholders like {{companyName}}, {{clientName}}, {{industry}}, {{servicesRequested}}, {{senderName}} with the appropriate values.
    3. If a placeholder's value is missing, use a professional generic alternative.
    4. Personalize the body slightly based on the industry if it adds value, but stay true to the template's structure.
    5. Ensure the email looks polished and ready to send.`;

    const userPrompt = `Template Subject: ${subject}
    Template Body:
    ${template}
    
    Generate the personalized subject and body based on the lead information provided. Return the result in the specified JSON format.`;

    const response = await ai.generate({
      prompt: userPrompt,
      system: systemPrompt,
      model: 'googleai/gemini-flash-latest',
      config: {
        temperature: 0.7,
      },
      output: {
        schema: ColdEmailOutputSchema,
      },
    });

    if (!response.output) {
        throw new Error('AI failed to generate email output');
    }

    return response.output;
  }
);
