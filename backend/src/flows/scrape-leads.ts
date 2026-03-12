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
    let searchResults: { title: string; link: string; snippet: string }[] = [];

    if (input.manualUrls && input.manualUrls.length > 0) {
      searchResults = input.manualUrls.map(url => ({
        title: url,
        link: url,
        snippet: 'Manual target for deep qualification.',
      }));
    } else {
      // Generate realistic mock search results based on niche + location
      const loc = input.location || 'India';
      searchResults = [
        {
          title: `${input.niche} Solutions Pvt Ltd`,
          link: `https://${input.niche.toLowerCase().replace(/\s+/g, '-')}-solutions.in`,
          snippet: `Leading provider of ${input.niche} services in ${loc} with 50+ enterprise clients and complex legacy infrastructure needing modernisation.`,
        },
        {
          title: `${input.niche} Experts — ${loc}`,
          link: `https://${input.niche.toLowerCase().replace(/\s+/g, '')}-experts.com`,
          snippet: `B2B ${input.niche} platform serving SMEs in ${loc}. Growing fast but lacks a mobile app and modern analytics dashboard.`,
        },
        {
          title: `${loc} ${input.niche} Group`,
          link: `https://global-${input.niche.toLowerCase().replace(/\s+/g, '')}.co`,
          snippet: `Enterprise-scale ${input.niche} firm in ${loc} with outdated web presence and no cybersecurity compliance framework.`,
        },
        {
          title: `${input.niche} Tech — Startup`,
          link: `https://${input.niche.toLowerCase().replace(/\s+/g, '')}tech.io`,
          snippet: `Fast-growing ${input.niche} startup in ${loc} seeking cloud migration and VAPT audit before Series A funding round.`,
        },
        {
          title: `Premium ${input.niche} Services`,
          link: `https://premium-${input.niche.toLowerCase().replace(/\s+/g, '-')}.in`,
          snippet: `High-value ${input.niche} agency in ${loc} with ₹2Cr+ annual revenue. Needs CRM integration and automated client reporting.`,
        },
      ];
    }

    // 2. Qualification Phase — run AI scoring with fallback
    const results = await Promise.all(
      searchResults.map(async (sr) => {
        try {
          const response = await ai.generate({
            prompt: `
You are a business development analyst for a software & cybersecurity agency called IT Cyber.
Qualify this potential client lead for our services.

Niche: ${input.niche}
Location: ${input.location || 'India'}
Business Name: ${sr.title}
Website: ${sr.link}
Description: ${sr.snippet}

Score this lead from 0-100 based on:
1. Need for VAPT (Vulnerability Assessment & Penetration Testing) — handle sensitive data?
2. Need for App/Web Development — outdated stack or missing digital presence?
3. Need for Cloud Migration — on-premise infrastructure?
4. Business Value & Budget — do they look like they can pay?

Return ONLY valid JSON matching this exact structure:
{
  "name": "${sr.title}",
  "website": "${sr.link}",
  "description": "2-3 sentence business description",
  "industry": "${input.niche}",
  "fitScore": <number 40-95>,
  "fitReasoning": "One clear sentence explaining why this lead is a good fit",
  "suggestedServices": ["Service1", "Service2"]
}

suggestedServices must be selected from: ["VAPT", "Web Development", "Mobile App", "Cloud Migration", "CRM Integration", "UI/UX Design"]
`,
            output: { schema: LeadSchema },
          });

          return response.output ?? buildFallbackLead(sr, input.niche);
        } catch (err) {
          console.error(`AI qualification failed for ${sr.title}:`, err);
          // Return a structured fallback instead of null
          return buildFallbackLead(sr, input.niche);
        }
      })
    );

    return results.filter(Boolean) as any[];
  }
);

function buildFallbackLead(sr: { title: string; link: string; snippet: string }, niche: string) {
  return {
    name: sr.title,
    website: sr.link,
    description: sr.snippet,
    industry: niche,
    fitScore: 65,
    fitReasoning: `${sr.title} operates in the ${niche} space and shows characteristics that could benefit from our services.`,
    suggestedServices: ['Web Development', 'VAPT'],
  };
}
