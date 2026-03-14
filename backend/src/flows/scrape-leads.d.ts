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
export declare function scrapeLeadsFlow(input: ScrapeLeadsInput): Promise<LeadResult[]>;
export {};
//# sourceMappingURL=scrape-leads.d.ts.map