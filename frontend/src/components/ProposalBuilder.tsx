"use client";

import { useState } from 'react';
import { Plus, Trash2, Save, X, FileText, Layout, Type, Clock, ShieldCheck, DollarSign, List, Edit3, Lock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import SignaturePad from './SignaturePad';

interface ProposalSection {
    id: string;
    title: string;
    content: any;
    type: 'text' | 'list' | 'pricing' | 'services';
}

interface ProposalBuilderProps {
    enquiryId: string;
    initialServices?: string[];
    onClose: () => void;
    onSave: () => void;
    existingProposal?: any;
}

export default function ProposalBuilder({ enquiryId, initialServices = [], onClose, onSave, existingProposal }: ProposalBuilderProps) {
    const [sections, setSections] = useState<ProposalSection[]>(existingProposal?.content || [
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
            id: 'pricing-table',
            title: 'Investment & Pricing',
            content: [
                { description: 'Core Platform Development', amount: 5000 },
                { description: 'UI/UX Design', amount: 2000 }
            ],
            type: 'pricing'
        },
        {
            id: 'terms',
            title: 'Terms & Conditions',
            content: 'Standard agency terms apply. 50% upfront, 50% on completion.',
            type: 'text'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(existingProposal?.title || `Proposal for ${enquiryId}`);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [status, setStatus] = useState(existingProposal?.status || 'DRAFT');

    const isLocked = status === 'SIGNED';

    const addSection = (type: 'text' | 'pricing' | 'services' = 'text') => {
        if (isLocked) return;
        const id = Math.random().toString(36).substr(2, 9);
        let content: any = '';
        if (type === 'pricing') content = [{ description: '', amount: 0 }];
        if (type === 'services') content = [{ title: '', description: '' }];

        setSections([...sections, {
            id,
            title: type === 'pricing' ? 'Investment Breakdown' : 'New Section',
            content,
            type
        }]);
    };

    const removeSection = (id: string) => {
        if (isLocked) return;
        setSections(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, field: keyof ProposalSection, value: any) => {
        if (isLocked) return;
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        if (isLocked) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = existingProposal 
                ? `${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiryId}/proposals/${existingProposal.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiryId}/proposals`;
            
            const method = existingProposal ? 'patch' : 'post';
            
            await axios[method](url, {
                title,
                content: sections,
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

    const handleSign = async (signature: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');
            const userName = userStr ? JSON.parse(userStr).name : 'Authorized Signatory';
            
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiryId}/proposals/${existingProposal.id}/sign`, {
                signature,
                signedBy: userName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatus('SIGNED');
            setShowSignaturePad(false);
            onSave();
        } catch (error: any) {
            console.error("Failed to sign proposal", error);
            alert(error.response?.data?.error || "Failed to sign proposal");
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
                        <div className={`p-2 rounded-xl ${isLocked ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {isLocked ? <ShieldCheck className="w-6 h-6" /> : <Layout className="w-6 h-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">Proposal {isLocked ? 'Locked' : 'Builder'}</h3>
                                {isLocked && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30 uppercase tracking-wider">Signed & Legal</span>}
                            </div>
                            <p className="text-sm text-neutral-500">{isLocked ? 'This proposal is electronically signed and cannot be modified' : 'Create a compelling project proposal'}</p>
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
                                {!isLocked && (
                                    <Trash2
                                        className="w-3.5 h-3.5 text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={(e) => { e.stopPropagation(); removeSection(s.id); }}
                                    />
                                )}
                            </button>
                        ))}
                        
                        {!isLocked && (
                            <div className="mt-8 pt-4 border-t border-neutral-800 space-y-4">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2">Add Blocks</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => addSection('text')} className="flex flex-col items-center gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500 transition-all group">
                                        <Type className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400" />
                                        <span className="text-[10px] font-bold">Text</span>
                                    </button>
                                    <button onClick={() => addSection('pricing')} className="flex flex-col items-center gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500 transition-all group">
                                        <DollarSign className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400" />
                                        <span className="text-[10px] font-bold">Pricing</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Editor */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-neutral-950/20">
                        <div className="max-w-3xl mx-auto space-y-12">
                            {/* Proposal Settings */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Proposal Title</label>
                                <input
                                    type="text"
                                    disabled={isLocked}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-black focus:outline-none placeholder:text-neutral-800 disabled:text-neutral-500"
                                    placeholder="Enter Proposal Title"
                                />
                                <div className={`h-1 w-20 rounded-full ${isLocked ? 'bg-green-500' : 'bg-indigo-500'}`} />
                            </div>

                            {/* Rendered Sections */}
                            {sections.map((section) => (
                                <div key={section.id} className="space-y-4 group">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            disabled={isLocked}
                                            value={section.title}
                                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                            className="text-lg font-bold bg-transparent focus:outline-none text-neutral-200 disabled:text-neutral-500"
                                        />
                                        <div className="flex-1 h-px bg-neutral-800" />
                                    </div>

                                    {section.type === 'pricing' ? (
                                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="text-neutral-500 border-b border-neutral-800">
                                                        <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Description</th>
                                                        <th className="pb-4 font-bold uppercase tracking-wider text-[10px] text-right">Amount</th>
                                                        {!isLocked && <th className="pb-4 w-10"></th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-800">
                                                    {Array.isArray(section.content) && section.content.map((item: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="py-4">
                                                                <input
                                                                    type="text"
                                                                    disabled={isLocked}
                                                                    value={item.description}
                                                                    onChange={(e) => {
                                                                        const newContent = [...section.content];
                                                                        newContent[i].description = e.target.value;
                                                                        updateSection(section.id, 'content', newContent);
                                                                    }}
                                                                    className="bg-transparent w-full focus:outline-none text-neutral-300 disabled:text-neutral-600"
                                                                    placeholder="Item description..."
                                                                />
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <input
                                                                    type="number"
                                                                    disabled={isLocked}
                                                                    value={item.amount}
                                                                    onChange={(e) => {
                                                                        const newContent = [...section.content];
                                                                        newContent[i].amount = parseFloat(e.target.value) || 0;
                                                                        updateSection(section.id, 'content', newContent);
                                                                    }}
                                                                    className="bg-transparent w-24 text-right focus:outline-none text-indigo-400 font-bold disabled:text-neutral-600"
                                                                />
                                                            </td>
                                                            {!isLocked && (
                                                                <td className="py-4 text-right">
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newContent = section.content.filter((_: any, idx: number) => idx !== i);
                                                                            updateSection(section.id, 'content', newContent);
                                                                        }}
                                                                        className="text-neutral-700 hover:text-red-500"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {!isLocked && (
                                                <button 
                                                    onClick={() => updateSection(section.id, 'content', [...section.content, { description: '', amount: 0 }])}
                                                    className="mt-4 text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Item
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <textarea
                                            disabled={isLocked}
                                            value={typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)}
                                            onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                                            className="w-full min-h-[150px] bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 text-sm leading-relaxed text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-neutral-900 transition-all disabled:text-neutral-600"
                                            placeholder={`Content for ${section.title}...`}
                                        />
                                    )}
                                </div>
                            ))}

                            {isLocked && existingProposal?.signature && (
                                <div className="mt-20 pt-10 border-t border-neutral-800">
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">Digitally Signed By</p>
                                        <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-green-500/20 max-w-xs w-full">
                                            <img src={existingProposal.signature} alt="Signature" className="w-full h-auto" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-white">{existingProposal.signedBy}</p>
                                            <p className="text-xs text-neutral-500">Signed on {new Date(existingProposal.signedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                        {isLocked ? 'Close' : 'Cancel'}
                    </button>
                    
                    <div className="flex gap-4">
                        {!isLocked && existingProposal && (
                            <button
                                onClick={() => setShowSignaturePad(true)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Sign & Finalize
                            </button>
                        )}
                        
                        {!isLocked && (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {existingProposal ? 'Update Proposal' : 'Save Proposal'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showSignaturePad && (
                <SignaturePad 
                    onSave={handleSign}
                    onCancel={() => setShowSignaturePad(false)}
                />
            )}
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
