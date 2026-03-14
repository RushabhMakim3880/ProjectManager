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
export declare function generateColdEmailFlow(input: GenerateColdEmailInput): Promise<ColdEmailOutput>;
//# sourceMappingURL=generate-cold-email.d.ts.map