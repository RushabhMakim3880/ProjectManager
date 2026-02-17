"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Printer,
    ChevronRight,
    Search,
    Briefcase,
    Shield,
    FileCheck,
    Settings as SettingsIcon,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

const DOCUMENT_TEMPLATES = [
    { id: 'prd', name: 'Product Requirement Document (PRD)', icon: FileText, color: 'text-indigo-400' },
    { id: 'sop', name: 'Standard Operating Procedure (SOP)', icon: SettingsIcon, color: 'text-emerald-400' },
    { id: 'delivery', name: 'Project Delivery Document', icon: FileCheck, color: 'text-sky-400' },
    { id: 'nda', name: 'Non-Disclosure Agreement (NDA)', icon: Shield, color: 'text-rose-400' },
    { id: 'agreement', name: 'Master Service Agreement', icon: Briefcase, color: 'text-amber-400' },
];

export default function DocumentsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [systemSettings, setSystemSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [docContent, setDocContent] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projRes, sysRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/system/settings')
                ]);
                setProjects(projRes.data);
                setSystemSettings(sysRes.data);
            } catch (err) {
                console.error("Failed to fetch documents data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const generateDocument = () => {
        if (!selectedProject || !selectedTemplate || !systemSettings) return;
        setGenerating(true);

        // Mock generation logic based on template
        setTimeout(() => {
            let content = '';
            const company = systemSettings.companyName || 'Our Company';
            const client = selectedProject.clientName || 'The Client';
            const date = new Date().toLocaleDateString();

            switch (selectedTemplate.id) {
                case 'nda':
                    content = `# NON-DISCLOSURE AGREEMENT\n\n**Effective Date:** ${date}\n\n**BETWEEN:**\n\n**${company}** ("The Disclosing Party")\nAND\n**${client}** ("The Receiving Party")\n\n### 1. PURPOSE\nThe parties wish to explore a business relationship related to **${selectedProject.name}**. In connection with this opportunity, the Disclosing Party may disclose certain proprietary and confidential information to the Receiving Party.`;
                    break;
                case 'prd':
                    content = `# PRD: ${selectedProject.name}\n\n**Client:** ${selectedProject.clientName}\n**Date:** ${date}\n\n## 1. Executive Summary\n${selectedProject.description || 'No description provided.'}\n\n## 2. Technical Stack\n${selectedProject.techStack || 'To be defined'}\n\n## 3. Core Objectives\n${selectedProject.objectives || 'To be defined'}`;
                    break;
                default:
                    content = `# ${selectedTemplate.name}\n\n**Project:** ${selectedProject.name}\n**Company:** ${company}\n**Client:** ${client}\n**Date:** ${date}\n\nThis document is automatically generated for professional distribution.`;
            }

            setDocContent(content);
            setGenerating(false);
        }, 800);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Document Intelligence</h1>
                    <p className="text-neutral-500 text-sm">Generate professional project documentation automatically</p>
                </div>
                {docContent && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="btn-outline flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" /> Print PDF
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="glass-card p-6 space-y-4">
                        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-2">1. Select Project</h2>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {projects.map(proj => (
                                <button
                                    key={proj.id}
                                    onClick={() => setSelectedProject(proj)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${selectedProject?.id === proj.id
                                            ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                        }`}
                                >
                                    <div className="truncate pr-4">
                                        <p className="text-sm font-semibold truncate">{proj.name}</p>
                                        <p className="text-[10px] uppercase font-bold text-neutral-600">{proj.clientName}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedProject?.id === proj.id ? 'translate-x-1 text-indigo-400' : 'text-neutral-700 group-hover:text-neutral-500'}`} />
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card p-6 space-y-4">
                        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-2">2. Select Template</h2>
                        <div className="space-y-2">
                            {DOCUMENT_TEMPLATES.map(tmpl => (
                                <button
                                    key={tmpl.id}
                                    onClick={() => setSelectedTemplate(tmpl)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 group ${selectedTemplate?.id === tmpl.id
                                            ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                        }`}
                                >
                                    <tmpl.icon className={`w-4 h-4 ${selectedTemplate?.id === tmpl.id ? tmpl.color : 'text-neutral-500 group-hover:text-neutral-400'}`} />
                                    <span className="text-sm font-medium">{tmpl.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <button
                        onClick={generateDocument}
                        disabled={!selectedProject || !selectedTemplate || generating}
                        className="w-full btn-primary h-12 flex items-center justify-center gap-2 font-bold shadow-xl shadow-indigo-900/20 active:scale-95 transition-all text-white"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        {generating ? 'Engine Running...' : 'Generate Document'}
                    </button>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2">
                    <div className="glass-card min-h-[700px] flex flex-col bg-neutral-950/50 border-dashed border-2 border-neutral-800">
                        {docContent ? (
                            <div className="p-12 print:p-0 bg-white text-black min-h-[1000px] shadow-2xl m-8 print:m-0 rounded-sm">
                                {/* Print Header */}
                                <div className="border-b-2 border-black pb-8 mb-8 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-black uppercase tracking-tighter">{systemSettings?.companyName}</h1>
                                        <p className="text-sm font-medium text-neutral-600">{systemSettings?.companyAddress}</p>
                                        <p className="text-sm font-medium text-neutral-600">{systemSettings?.companyEmail}</p>
                                    </div>
                                    {systemSettings?.companyLogo && (
                                        <img src={systemSettings.companyLogo} alt="Logo" className="h-16 w-auto grayscale" />
                                    )}
                                </div>

                                <div className="prose prose-sm max-w-none whitespace-pre-wrap font-serif">
                                    {docContent}
                                </div>

                                {/* Print Footer */}
                                <div className="mt-20 pt-8 border-t border-neutral-200 text-[10px] text-neutral-400 flex justify-between uppercase font-bold tracking-widest">
                                    <span>Generated via Strategic Project Tracker</span>
                                    <span>Page 1 of 1</span>
                                    <span>{new Date().toISOString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 p-12 text-center">
                                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
                                    <FileText className="w-8 h-8 opacity-20" />
                                </div>
                                <h3 className="text-lg font-medium text-neutral-400">No Document Generated</h3>
                                <p className="text-sm max-w-xs mt-2">Select a project and template from the left to begin the generation engine.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
