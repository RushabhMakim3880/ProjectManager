import { ai } from '../lib/genkit.js';

export interface GenerateColdEmailInput {
  template: string;
  subject: string;
  lead: {
    companyName: string;
    clientName?: string;
    industry: string;
    servicesRequested?: string;
    website: string;
    linkedin?: string;
    location?: string;
  };
  senderName?: string;
}

export interface ColdEmailOutput {
  subject: string;
  body: string;
}

export async function generateColdEmailFlow(input: GenerateColdEmailInput): Promise<ColdEmailOutput> {
  const { template, subject, lead, senderName = 'Agency Partner' } = input;

  const systemPrompt = `You are an expert cold email specialist for an Indian IT agency called IT Cyber. 
Personalize the provided email template for a potential lead.

Lead Info:
- Company: ${lead.companyName}
- Contact Name: ${lead.clientName || 'Team'}
- Industry: ${lead.industry}
- Website: ${lead.website}
- Location: ${lead.location || 'India'}
- Services Requested: ${lead.servicesRequested || 'Digital transformation'}

Sender: ${senderName}

Rules:
1. Replace ALL placeholders like {{companyName}}, {{clientName}}, {{industry}}, {{servicesRequested}}, {{senderName}} with actual values.
2. Maintain the professional tone of the template.
3. Keep the email concise, persuasive, and ready to send.
4. Return ONLY a JSON object with "subject" and "body" fields.`;

  const userPrompt = `Template Subject: ${subject}
Template Body:
${template}

Return as JSON: {"subject": "...", "body": "..."}`;

  const response = await ai.generate({
    prompt: userPrompt,
    system: systemPrompt,
    config: { temperature: 0.7 },
  });

  // Parse structured output
  if (response.output && (response.output as any).subject) {
    return response.output as ColdEmailOutput;
  }

  // Extract JSON from text response
  const text = response.text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.subject && parsed.body) {
        return parsed as ColdEmailOutput;
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Last resort: construct a basic personalized version
  const fallbackBody = template
    .replace(/\{\{companyName\}\}/g, lead.companyName)
    .replace(/\{\{clientName\}\}/g, lead.clientName || 'Team')
    .replace(/\{\{industry\}\}/g, lead.industry)
    .replace(/\{\{servicesRequested\}\}/g, lead.servicesRequested || 'our services')
    .replace(/\{\{senderName\}\}/g, senderName)
    .replace(/\{\{niche\}\}/g, lead.industry);

  const fallbackSubject = subject
    .replace(/\{\{companyName\}\}/g, lead.companyName)
    .replace(/\{\{niche\}\}/g, lead.industry);

  return { subject: fallbackSubject, body: fallbackBody };
}
