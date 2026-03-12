import { z } from 'zod';
import { ai } from '../lib/genkit.js';

const LeadSchema = z.object({
  name: z.string(),
  website: z.string().optional(),
  description: z.string(),
  industry: z.string(),
  contactEmail: z.string().optional(),
  fitScore: z.number().min(0).max(100),
  fitReasoning: z.string(),
  suggestedServices: z.array(z.string()),
});

const SearchResultsSchema = z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string()
}));

export const scrapeLeadsFlow = ai.defineFlow(
  {
    name: 'scrapeLeadsFlow',
    inputSchema: z.object({
      niche: z.string(),
      location: z.string().optional(),
      manualUrls: z.array(z.string()).optional(),
    }),
    outputSchema: z.array(LeadSchema),
  },
  async (input) => {
    // 1. Discovery Phase
    let searchResults = [];
    
    if (input.manualUrls && input.manualUrls.length > 0) {
        searchResults = input.manualUrls.map(url => ({
            title: url,
            link: url,
            snippet: "Manual target for deep qualification."
        }));
    } else {
        // Fallback to mock search results if SERP API is missing
        // In a real prod environment, we'd use Serper.dev or similar here
        searchResults = [
            { title: `${input.niche} Co - ${input.location || 'Global'}`, link: 'https://example-biz-1.com', snippet: `Leading provider of ${input.niche} services with a complex legacy system.` },
            { title: `${input.niche} Solutions`, link: 'https://example-biz-2.com', snippet: `B2B platform for ${input.niche} professionals needing mobile expansion.` },
            { title: `Global ${input.niche} Inc`, link: 'https://global-niche.co', snippet: `Enterprise ${input.niche} group with outdated web presence.` }
        ];
    }

    // 2. Qualification Phase
    const results = await Promise.all(searchResults.map(async (sr) => {
        const response = await ai.generate({
            prompt: `
            Analyze this potential lead for a software development & cybersecurity agency.
            Niche: ${input.niche}
            Business Name: ${sr.title}
            Website/Snippet: ${sr.link} - ${sr.snippet}

            Qualify this lead based on:
            1. Need for VAPT (Vulnerability Assessment and Penetration Testing) - do they handle sensitive data?
            2. Need for App/Web Development - does their current stack seem outdated?
            3. Business Value - do they look like they have budget?

            Return a score from 0-100 and a brief reasoning.
            Suggested services should be from: VAPT, Web Dev, Mobile App, Cloud Migration.
            `,
            output: { schema: LeadSchema }
        });
        
        return response.output;
    }));

    return results.filter(r => r !== null) as any[];
  }
);
