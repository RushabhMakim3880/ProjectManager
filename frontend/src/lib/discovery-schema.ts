// Schema definition for dynamic discovery form fields based on requested services

export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'date';

export interface DiscoveryField {
    id: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
}

export interface ServiceDiscoveryConfig {
    keywords: string[]; // Triggers this section if the selected service contains any of these
    title: string;
    description: string;
    fields: DiscoveryField[];
}

export const DISCOVERY_SCHEMA: ServiceDiscoveryConfig[] = [
    {
        keywords: ['Web', 'Website', 'SaaS', 'Portal', 'e-commerce'],
        title: 'Web Application & Product Discovery',
        description: 'Help us understand your web project requirements.',
        fields: [
            { id: 'web_primary_goal', label: 'What is the primary goal of the website/app?', type: 'select', options: ['Lead Generation', 'E-commerce / Sales', 'SaaS / Product', 'Informational', 'Internal Tool'], required: true },
            { id: 'web_design_references', label: 'Design Reference: Please share 2-3 websites you like in terms of design, layout, or style. *', type: 'textarea', required: true },
            { id: 'web_target_audience', label: 'Who is the primary target audience?', type: 'textarea', required: true },
            { id: 'web_structure', label: 'Website Structure: Are there multiple sub-companies or distinct sections to be featured?', type: 'textarea' },
            { id: 'web_brand_colors', label: 'Brand Identity: Do you have specific brand colors or exact color codes? (e.g. HEX/RGB)', type: 'textarea' },
            { id: 'web_assets_availability', label: 'Logos & Media: Do you have logos, company photos, etc., readily available?', type: 'radio', options: ['Yes, fully available', 'Some available, some required', 'No, need creation'] },
            { id: 'web_domain_hosting', label: 'Domain Names & Hosting: Do you already own domains and/or hosting?', type: 'radio', options: ['Yes, have both', 'Have Domain only', 'Have Hosting only', 'No, need both'] },
            { id: 'web_social_media', label: 'Social Media Links: Do you have existing pages (Instagram, LinkedIn, etc.) to integrate?', type: 'textarea' },
            { id: 'web_key_features', label: 'What are the key features required? (e.g., Contact forms, WhatsApp chat, Image galleries, CMS, Login)', type: 'textarea', required: true },
            { id: 'web_competitors', label: 'Who are your main competitors, and what do you like/dislike about their platforms?', type: 'textarea' },
            { id: 'web_integrations', label: 'Are there any third-party integrations required? (e.g., Stripe, Salesforce, ERP, CRM)', type: 'textarea' },
            { id: 'web_maintenance', label: 'Do you need ongoing maintenance and support after launch?', type: 'radio', options: ['Yes', 'No', 'Not sure yet'] }
        ]
    },
    {
        keywords: ['Mobile', 'Android', 'iOS', 'Flutter', 'React Native'],
        title: 'Mobile App Discovery',
        description: 'Details for your mobile application development.',
        fields: [
            { id: 'mobile_status', label: 'Is this a brand new app or an update to an existing one?', type: 'radio', options: ['Brand New', 'Update Existing App'], required: true },
            { id: 'mobile_platforms', label: 'Target Platforms', type: 'multiselect', options: ['iOS', 'Android', 'Both', 'Not Sure'], required: true },
            { id: 'mobile_features', label: 'Core Features Required (e.g., Push notifications, Camera access, Maps, Offline mode)', type: 'textarea', required: true },
            { id: 'mobile_roles', label: 'Will the app have different user roles? (e.g., Customer, Driver, Admin)', type: 'textarea' },
            { id: 'mobile_monetization', label: 'Do you plan to monetize the app?', type: 'multiselect', options: ['In-app purchases', 'Subscriptions', 'Ads', 'Paid upfront', 'None/Internal use'] },
            { id: 'mobile_backend', label: 'Do you need us to build the backend API and admin panel?', type: 'radio', options: ['Yes', 'No, we have an API', 'Not sure'] }
        ]
    },
    {
        keywords: ['Cybersecurity', 'VAPT', 'Security', 'Penetration', 'Audit'],
        title: 'Security Assessment Framework',
        description: 'Information regarding the scope of the security assessment.',
        fields: [
            { id: 'sec_scope', label: 'What is the primary scope? (Number of endpoints, web apps, mobile apps, IPs)', type: 'textarea', required: true },
            { id: 'sec_auth', label: 'Does the application require authentication?', type: 'radio', options: ['Yes', 'No'], required: true },
            { id: 'sec_roles', label: 'If authenticated, how many user roles exist in the application?', type: 'text' },
            { id: 'sec_infra', label: 'Describe your hosting landscape / infrastructure', type: 'select', options: ['AWS', 'Azure', 'GCP', 'On-Premise', 'Hybrid', 'Other'] },
            { id: 'sec_compliance', label: 'Is this for a specific compliance requirement?', type: 'multiselect', options: ['PCI-DSS', 'HIPAA', 'SOC2', 'ISO 27001', 'GDPR', 'None/General Hardening'] },
            { id: 'sec_timeline_urgency', label: 'When do you need the final security report delivered?', type: 'text', required: true }
        ]
    },
    {
        keywords: ['3D', 'Virtual reality', 'Augmented reality', 'Visualization', 'Motion graphics', 'UI', 'UX'],
        title: 'Creative & Immersive Design Scope',
        description: 'Details for creative production and visual assets.',
        fields: [
            { id: 'creative_description', label: 'Describe the visual experience or design goal you want to achieve.', type: 'textarea', required: true },
            { id: 'creative_assets_provided', label: 'Do you have existing assets? (3D models, CAD files, brand kit)', type: 'radio', options: ['Yes, fully detailed', 'Some references', 'No, create from scratch'] },
            { id: 'creative_resolution', label: 'Required Output Resolution/Platform (e.g., WebGL, VR Headset, 4K Video)', type: 'text', required: true },
            { id: 'creative_references', label: 'Please provide links to any visual references or mood boards.', type: 'textarea' }
        ]
    },
    {
        keywords: ['IoT', 'Embedded', 'firmware', 'Automation'],
        title: 'Specialized Engineering Details',
        description: 'Information for hardware and specialized software solutions.',
        fields: [
            { id: 'eng_hardware', label: 'What hardware/devices are involved?', type: 'textarea', required: true },
            { id: 'eng_protocols', label: 'Required communication protocols? (e.g., MQTT, BLE, Zigbee)', type: 'text' },
            { id: 'eng_certification', label: 'Are hardware certifications required? (e.g., FCC, CE)', type: 'radio', options: ['Yes', 'No', 'Not sure'] }
        ]
    }
];

export const GENERAL_DISCOVERY_FIELDS: DiscoveryField[] = [
    { id: 'detailed_budget_range', label: 'Detailed Budget Allocation (If applicable)', type: 'select', options: ['Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000 - $100,000', '$100,000+'], required: true },
    { id: 'project_goals', label: 'What does a successful outcome look like for this project? (KPIs)', type: 'textarea', required: true },
    { id: 'technical_risks', label: 'What are the biggest challenges or technical risks you foresee with this project?', type: 'textarea' },
    { id: 'decision_makers', label: 'Who are the key decision makers and points of contact?', type: 'textarea', required: true }
];
