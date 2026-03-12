"use client";

import React, { useState } from 'react';
import { 
    FileUp, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Target, 
    Palette, 
    Layers, 
    Clock, 
    History,
    Settings,
    Layout
} from 'lucide-react';
import axios from 'axios';

interface DiscoveryDataViewProps {
    enquiryId: string;
    discoveryData: any;
    onRefresh: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DiscoveryDataView({ enquiryId, discoveryData, onRefresh }: DiscoveryDataViewProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${API_URL}/enquiries/${enquiryId}/extract-questionnaire`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            onRefresh();
        } catch (err: any) {
            console.error('Extraction error:', err);
            const errorData = err.response?.data;
            const errorMessage = typeof errorData === 'string' 
                ? errorData 
                : errorData?.message || errorData?.error || 'Failed to extract data. Please try again.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setUploading(false);
        }
    };

    if (!discoveryData || Object.keys(discoveryData).length === 0) {
        return (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                </div>
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-white mb-2">AI Discovery Extraction</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        Upload a client-filled questionnaire (PDF or Image) and our AI will automatically extract goals, features, and brand details for you.
                    </p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                    <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all cursor-pointer shadow-xl shadow-indigo-600/20 active:scale-95">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
                        {uploading ? 'Processing with AI...' : 'Upload Questionnaire'}
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" disabled={uploading} />
                    </label>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Supports PDF, PNG, JPG (Max 50MB)</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-xs font-bold mx-auto w-fit border border-red-400/20">
                        <AlertCircle className="w-4 h-4" />
                        {typeof error === 'string' ? error : 'An unexpected error occurred'}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">Extracted Discovery Data</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">Processed by AI Vision</p>
                    </div>
                </div>
                <label className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer border border-neutral-700">
                    <History className="w-4 h-4" />
                    Re-extract
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" disabled={uploading} />
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project Core */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" />
                        Project Core
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Primary Goals</label>
                            <p className="text-sm text-neutral-200 mt-1 leading-relaxed">{discoveryData.projectGoals || 'Not specified'}</p>
                        </div>
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Timeline/Deadline</label>
                            <p className="text-sm text-neutral-200 mt-1">{discoveryData.timeline || 'Not specified'}</p>
                        </div>
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Budget Mentioned</label>
                            <p className="text-sm text-neutral-200 mt-1">{discoveryData.budgetRange || 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Technical & Features */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Settings className="w-4 h-4 text-emerald-500" />
                        Key Features & Tech
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {discoveryData.keyFeatures?.map((feature: string) => (
                                <span key={feature} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                                    {feature}
                                </span>
                            ))}
                        </div>
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Technical Requirements</label>
                            <p className="text-sm text-neutral-400 mt-1">{discoveryData.technicalRequirements || 'None specified'}</p>
                        </div>
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">References/Competitors</label>
                            <p className="text-sm text-neutral-400 mt-1">{discoveryData.competitors || 'None specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Identity & Structure */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-500" />
                        Brand & Structure
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Colors</label>
                            <p className="text-sm text-neutral-200 mt-1">{discoveryData.brandIdentity?.colors || 'Pending'}</p>
                        </div>
                        <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                            <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Typography</label>
                            <p className="text-sm text-neutral-200 mt-1">{discoveryData.brandIdentity?.fonts || 'Pending'}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800">
                        <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Logistics Info</label>
                        <p className="text-sm text-neutral-400 mt-1">{discoveryData.websiteStructure || 'Not specified'}</p>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-6">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-500" />
                        AI Summary
                    </h3>
                    <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl h-full">
                        <p className="text-sm text-neutral-300 leading-relaxed italic">
                            "{discoveryData.rawSummary || 'No additional summary provided.'}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
