"use client";

import { useState } from 'react';
import { Plus, Trash2, Save, X, FileText, Layout, Type, Clock, ShieldCheck } from 'lucide-react';
import axios from 'axios';

interface ProposalSection {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'list' | 'blocks';
}

interface ProposalBuilderProps {
    enquiryId: string;
    initialServices?: string[];
    onClose: () => void;
    onSave: () => void;
}

export default function ProposalBuilder({ enquiryId, initialServices = [], onClose, onSave }: ProposalBuilderProps) {
    const [sections, setSections] = useState<ProposalSection[]>([
        {
            id: 'exec-summary',
            title: 'Executive Summary',
            content: 'High-level overview of the digital transformation we are proposing...',
            type: 'text'
        },
        {
            id: 'scope',
            title: 'Project Scope',
            content: initialServices.join('\n'),
            type: 'list'
        },
        {
            id: 'timeline',
            title: 'Proposed Timeline',
            content: 'Phase 1: Discovery (Week 1)\nPhase 2: Design (Week 2-4)\nPhase 3: Development (Week 5-10)\nPhase 4: Launch (Week 12)',
            type: 'text'
        },
        {
            id: 'terms',
            title: 'Terms & Conditions',
            content: 'Standard agency terms apply. 50% upfront, 50% on completion.',
            type: 'text'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(`Proposal for ${enquiryId}`);

    const addSection = () => {
        setSections([...sections, {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Section',
            content: '',
            type: 'text'
        }]);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, field: keyof ProposalSection, value: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiryId}/proposals`, {
                title,
                content: sections, // Save as JSON blocks
                status: 'DRAFT'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSave();
            onClose();
        } catch (error: any) {
            console.error("Failed to save proposal", error);
            alert(error.response?.data?.error || "Failed to save proposal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md text-white">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                            <Layout className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Proposal Builder</h3>
                            <p className="text-sm text-neutral-500">Create a compelling project proposal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-64 border-r border-neutral-800 bg-neutral-950/30 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-4">Structure</p>
                        {sections.map((s, idx) => (
                            <button
                                key={s.id}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all flex items-center justify-between group"
                            >
                                <span className="truncate flex items-center gap-2">
                                    <span className="text-neutral-600 font-mono text-[10px]">{idx + 1}</span>
                                    {s.title}
                                </span>
                                <Trash2
                                    className="w-3.5 h-3.5 text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={(e) => { e.stopPropagation(); removeSection(s.id); }}
                                />
                            </button>
                        ))}
                        <button
                            onClick={addSection}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-neutral-700 rounded-xl text-xs font-bold text-neutral-500 hover:border-indigo-500 hover:text-indigo-400 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Section
                        </button>
                    </div>

                    {/* Main Editor */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-neutral-950/20">
                        <div className="max-w-3xl mx-auto space-y-12">
                            {/* Proposal Settings */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Proposal Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-black focus:outline-none placeholder:text-neutral-800"
                                    placeholder="Enter Proposal Title"
                                />
                                <div className="h-1 w-20 bg-indigo-500 rounded-full" />
                            </div>

                            {/* Rendered Sections */}
                            {sections.map((section) => (
                                <div key={section.id} className="space-y-4 group">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                            className="text-lg font-bold bg-transparent focus:outline-none text-neutral-200"
                                        />
                                        <div className="flex-1 h-px bg-neutral-800 group-hover:bg-neutral-700 transition-all" />
                                    </div>
                                    <textarea
                                        value={section.content}
                                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                                        className="w-full min-h-[150px] bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 text-sm leading-relaxed text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-neutral-900 transition-all"
                                        placeholder={`Content for ${section.title}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Proposal
                    </button>
                </div>
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
