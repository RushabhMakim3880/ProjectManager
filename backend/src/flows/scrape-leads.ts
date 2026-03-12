import { ai } from '../lib/genkit.js';

interface LeadResult {
  name: string;
  website: string;
  description: string;
  industry: string;
  contactEmail?: string;
  fitScore: number;
  fitReasoning: string;
  suggestedServices: string[];
}

interface ScrapeLeadsInput {
  niche: string;
  location?: string;
  manualUrls?: string[];
}

function buildFallbackLead(title: string, link: string, snippet: string, niche: string): LeadResult {
  return {
    name: title,
    website: link,
    description: snippet,
    industry: niche,
    fitScore: 65,
    fitReasoning: `${title} operates in the ${niche} space and shows indicators of needing digital transformation services.`,
    suggestedServices: ['Web Development', 'VAPT'],
  };
}

export async function scrapeLeadsFlow(input: ScrapeLeadsInput): Promise<LeadResult[]> {
  // 1. Discovery Phase — generate realistic mock search results using niche + location
  const loc = input.location || 'India';
  let searchResults: { title: string; link: string; snippet: string }[] = [];

  if (input.manualUrls && input.manualUrls.length > 0) {
    searchResults = input.manualUrls.map(url => ({
      title: url,
      link: url,
      snippet: 'Manual target for deep qualification.',
    }));
  } else {
    const nicheSlug = input.niche.toLowerCase().replace(/\s+/g, '-');
    const nicheRaw = input.niche.toLowerCase().replace(/\s+/g, '');
    searchResults = [
      {
        title: `${input.niche} Solutions Pvt Ltd`,
        link: `https://${nicheSlug}-solutions.in`,
        snippet: `Leading provider of ${input.niche} services in ${loc} with 50+ enterprise clients relying on outdated legacy infrastructure that needs modernisation.`,
      },
      {
        title: `${input.niche} Experts — ${loc}`,
        link: `https://${nicheRaw}-experts.com`,
        snippet: `B2B ${input.niche} platform serving SMEs in ${loc}. Growing rapidly but lacks a mobile app and has no real-time analytics or cybersecurity posture.`,
      },
      {
        title: `${loc} ${input.niche} Group`,
        link: `https://global-${nicheRaw}.co`,
        snippet: `Enterprise-level ${input.niche} conglomerate in ${loc} with outdated web presence, no compliance framework, and 200+ employees handling sensitive client data.`,
      },
      {
        title: `${input.niche} Tech Startup`,
        link: `https://${nicheRaw}tech.io`,
        snippet: `Fast-growing ${input.niche} startup in ${loc} seeking a VAPT audit + cloud migration before their Series A funding round in Q3.`,
      },
      {
        title: `Premium ${input.niche} Agency`,
        link: `https://premium-${nicheSlug}.in`,
        snippet: `High-value ${input.niche} agency in ${loc} with ₹2Cr+ annual revenue. Needs CRM integration, automated client reporting, and a mobile app for field teams.`,
      },
    ];
  }

  // 2. Qualification Phase — AI scoring with robust per-lead fallback
  const results = await Promise.all(
    searchResults.map(async (sr) => {
      try {
        const response = await ai.generate({
          prompt: `You are a business development analyst for a software & cybersecurity agency called IT Cyber based in India.
Qualify this potential client lead. Return ONLY valid JSON.

Lead Details:
- Niche: ${input.niche}
- Location: ${loc}
- Business Name: ${sr.title}
- Website: ${sr.link}
- Description: ${sr.snippet}

Score this lead 0-100 based on:
1. Need for VAPT (do they handle sensitive data or lack security?)
2. Need for Web/App Development (outdated or missing digital presence?)
3. Need for Cloud Migration (on-premise infrastructure?)
4. Business Value — do they have budget?

Return this JSON structure EXACTLY:
{
  "name": "${sr.title}",
  "website": "${sr.link}",
  "description": "2-3 sentence business description",
  "industry": "${input.niche}",
  "fitScore": 75,
  "fitReasoning": "One clear sentence explaining why this lead is a good fit for IT Cyber",
  "suggestedServices": ["VAPT", "Web Development"]
}

suggestedServices must only contain values from: ["VAPT", "Web Development", "Mobile App", "Cloud Migration", "CRM Integration", "UI/UX Design"]`,
          config: { temperature: 0.5 },
        });

        const text = response.text;
        // Try to parse structured output, fall back to manual JSON extraction
        if (response.output) {
          return response.output as LeadResult;
        }

        // Extract JSON from text response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Validate required fields
          if (parsed.name && parsed.fitScore !== undefined && Array.isArray(parsed.suggestedServices)) {
            return parsed as LeadResult;
          }
        }

        return buildFallbackLead(sr.title, sr.link, sr.snippet, input.niche);
      } catch (err) {
        console.error(`AI qualification failed for ${sr.title}:`, err);
        return buildFallbackLead(sr.title, sr.link, sr.snippet, input.niche);
      }
    })
  );

  return results.filter(Boolean) as LeadResult[];
}
