export const PROJECT_DOMAINS = [
    "Software and Application Development",
    "Cybersecurity and Offensive Security Services",
    "Emerging and Immersive Technologies",
    "Creative and Digital Production",
    "Specialized Engineering and Advanced Solutions"
] as const;

export interface ProjectService {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export const PROJECT_SERVICES: Record<string, ProjectService[]> = {
    "Software and Application Development": [
        {
            id: "custom-web-dev",
            name: "Custom Web Application Development",
            description: "End-to-end full-stack systems including frontend, backend and database architecture.",
            icon: "Globe"
        },
        {
            id: "website-design",
            name: "Website Design & Development",
            description: "High-performance corporate sites, e-commerce platforms and custom portals.",
            icon: "Layout"
        },
        {
            id: "pwa-development",
            name: "Progressive Web Applications",
            description: "App-like mobile experiences delivered through the web browser.",
            icon: "Zap"
        },
        {
            id: "android-dev",
            name: "Android Mobile Development",
            description: "Native Android application development and Play Store deployment.",
            icon: "Smartphone"
        },
        {
            id: "ios-dev",
            name: "iOS Mobile Development",
            description: "Native iOS application development and App Store deployment.",
            icon: "Smartphone"
        },
        {
            id: "cross-platform-mobile",
            name: "Cross-Platform Mobile",
            description: "Unified mobile applications using Flutter or React Native frameworks.",
            icon: "Smartphone"
        },
        {
            id: "desktop-apps",
            name: "Desktop Application Development",
            description: "Native solutions for Windows, macOS and Linux environments.",
            icon: "Monitor"
        },
        {
            id: "api-integration",
            name: "API & System Integrations",
            description: "Building robust APIs and connecting third-party systems seamlessly.",
            icon: "Webhook"
        },
        {
            id: "saas-development",
            name: "SaaS Platform Development",
            description: "Scalable multi-tenant architectures and subscription-based systems.",
            icon: "Cloud"
        },
        {
            id: "admin-panels",
            name: "Custom Admin Panels & Dashboards",
            description: "Powerful internal tools and dashboards for data management.",
            icon: "Settings"
        },
        {
            id: "business-automation",
            name: "Business Process Automation",
            description: "Custom software to automate repetitive tasks and optimize workflows.",
            icon: "Cpu"
        },
        {
            id: "maintenance-support",
            name: "Ongoing Technical Support",
            description: "Continuous maintenance, updates and infrastructure monitoring.",
            icon: "LifeBuoy"
        }
    ],
    "Cybersecurity and Offensive Security Services": [
        {
            id: "security-consulting",
            name: "Cybersecurity Consulting",
            description: "End-to-end strategy and security architecture design.",
            icon: "Shield"
        },
        {
            id: "vapt-full",
            name: "Full-Spectrum VAPT",
            description: "Vulnerability Assessment and Penetration Testing for entire ecosystems.",
            icon: "Lock"
        },
        {
            id: "web-vapt",
            name: "Web Application VAPT",
            description: "Deep security analysis and penetration testing for web platforms.",
            icon: "Globe"
        },
        {
            id: "mobile-vapt",
            name: "Mobile Application VAPT",
            description: "Security assessment for Android and iOS applications.",
            icon: "Smartphone"
        },
        {
            id: "api-security",
            name: "API & Endpoint Security",
            description: "Validation and security testing for public and private APIs.",
            icon: "Webhook"
        },
        {
            id: "cloud-security",
            name: "Cloud Security Testing",
            description: "Configuration review and testing for AWS, Azure and GCP.",
            icon: "Cloud"
        },
        {
            id: "infrastructure-pt",
            name: "Infrastructure Pentesting",
            description: "Network security analysis and server-level penetration testing.",
            icon: "Server"
        },
        {
            id: "iot-security",
            name: "IoT & Firmware Security",
            description: "Testing embedded devices and hardware-level security.",
            icon: "Cpu"
        },
        {
            id: "scada-security",
            name: "SCADA & Industrial Security",
            description: "Critical infrastructure and industrial control system testing.",
            icon: "Factory"
        },
        {
            id: "code-review",
            name: "Secure Source Code Review",
            description: "Deep static and dynamic analysis of application source code.",
            icon: "FileCode"
        },
        {
            id: "code-hardening",
            name: "Secure Code Hardening",
            description: "Remediation support and implementing secure coding practices.",
            icon: "ShieldCheck"
        },
        {
            id: "red-teaming",
            name: "Red Team Engagements",
            description: "Full-scale simulated adversarial attacks and assessments.",
            icon: "Target"
        },
        {
            id: "phishing-sim",
            name: "Phishing Simulations",
            description: "Employee awareness testing and social engineering assessments.",
            icon: "Mail"
        },
        {
            id: "security-audits",
            name: "Security & Compliance Audits",
            description: "Auditing systems for SOC2, ISO, or custom compliance needs.",
            icon: "ClipboardCheck"
        },
        {
            id: "incident-response",
            name: "Incident Response Readiness",
            description: "Developing response plans and immediate advisory support.",
            icon: "Activity"
        },
        {
            id: "cyber-tools",
            name: "Custom Security Tooling",
            description: "Development of internal security and automation tools.",
            icon: "Terminal"
        }
    ],
    "Emerging and Immersive Technologies": [
        {
            id: "augmented-reality",
            name: "Augmented Reality (AR)",
            description: "AR apps for mobile and wearable platforms like Vision Pro.",
            icon: "Glasses"
        },
        {
            id: "virtual-reality",
            name: "Virtual Reality (VR)",
            description: "High-fidelity VR experiences and industrial simulations.",
            icon: "Layers"
        },
        {
            id: "mixed-reality",
            name: "Mixed Reality Environments",
            description: "Interactive environments blending digital and physical reality.",
            icon: "Box"
        },
        {
            id: "3d-visualization",
            name: "3D Visualization Systems",
            description: "Immersive product and environment visualization tools.",
            icon: "Cube"
        },
        {
            id: "metaverse-dev",
            name: "Metaverse Digital Assets",
            description: "Digital environment creation for the next-gen internet.",
            icon: "Globe"
        }
    ],
    "Creative and Digital Production": [
        {
            id: "3d-modeling",
            name: "Professional 3D Modeling",
            description: "High-quality assets for products, games and environments.",
            icon: "Box"
        },
        {
            id: "product-visualization",
            name: "Product Rendering",
            description: "Photorealistic rendering for marketing and prototypes.",
            icon: "Eye"
        },
        {
            id: "archi-viz",
            name: "Architectural Visualization",
            description: "Realistic walkthroughs and 3D architectural renderings.",
            icon: "Home"
        },
        {
            id: "video-production",
            name: "Video Post-Production",
            description: "Professional editing, color grading and storytelling.",
            icon: "Video"
        },
        {
            id: "motion-graphics",
            name: "Motion Graphics & VFX",
            description: "Animated digital assets for premium visual content.",
            icon: "Film"
        },
        {
            id: "explainer-videos",
            name: "Technical Explainer Videos",
            description: "Simplifying complex concepts through visual storytelling.",
            icon: "Play"
        },
        {
            id: "ui-ux-design",
            name: "Figma UI/UX Design",
            description: "State-of-the-art interface design and user experience mapping.",
            icon: "PenTool"
        },
        {
            id: "branding-production",
            name: "Digital Branding Production",
            description: "Premium visual assets and digital brand guidelines.",
            icon: "Palette"
        }
    ],
    "Specialized Engineering and Advanced Solutions": [
        {
            id: "iot-development",
            name: "IoT Product Development",
            description: "End-to-end hardware-software development for IoT devices.",
            icon: "Cpu"
        },
        {
            id: "embedded-systems",
            name: "Embedded Systems Engine",
            description: "Low-level firmware and embedded software solutions.",
            icon: "Microchip"
        },
        {
            id: "smart-automation",
            name: "Smart Device Integration",
            description: "Hardware integration and smart office/home automation.",
            icon: "Lightbulb"
        },
        {
            id: "custom-scripts",
            name: "Custom Automation Scripts",
            description: "Powerful scripts to bridge legacy workflows and new systems.",
            icon: "Terminal"
        },
        {
            id: "data-analytics",
            name: "Data Analytics Platforms",
            description: "Advanced dashboards and visual data analysis systems.",
            icon: "BarChart"
        },
        {
            id: "ai-features",
            name: "AI & ML Integrations",
            description: "Implementing intelligent features and models into apps.",
            icon: "Brain"
        },
        {
            id: "internal-operations-tools",
            name: "Operations Process Tools",
            description: "Strategic internal tools for operational optimization.",
            icon: "Settings"
        }
    ]
};
