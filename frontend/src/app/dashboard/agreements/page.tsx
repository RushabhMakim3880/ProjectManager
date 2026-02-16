"use client";

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, ShieldCheck, Download, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function AgreementViewer() {
    const [signed, setSigned] = useState(false);
    const [agreement, setAgreement] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAgreement = async () => {
        setLoading(true);
        try {
            const res = await api.get('/agreements/current');
            setAgreement(res.data);
        } catch (err) {
            console.error("Failed to fetch agreement", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgreement();
    }, []);

    const defaultAgreement = {
        version: 1,
        content: `# PARTNERSHIP AGREEMENT\n\nThis agreement outlines the contribution-based profit sharing model. No current version found in system.`
    };

    const activeAgreement = agreement || defaultAgreement;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-indigo-500" />
                        Partnership Agreement
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">Review and sign the latest operating agreement</p>
                </div>
                <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Version {activeAgreement.version}
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="bg-neutral-900/50 p-4 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>operating_agreement_v{activeAgreement.version}.md</span>
                    </div>
                    <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-500 hover:text-white">
                        <Download className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-8 prose prose-invert max-w-none min-h-[400px] bg-neutral-950/50 font-light leading-relaxed whitespace-pre-wrap text-neutral-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : activeAgreement.content}
                </div>

                <div className="p-6 bg-neutral-900/50 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-3">
                        <div
                            className={`mt-1 w-5 h-5 rounded border ${signed ? 'bg-indigo-600 border-indigo-500' : 'border-neutral-700'} flex items-center justify-center transition-colors cursor-pointer`}
                            onClick={() => setSigned(!signed)}
                        >
                            {signed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p className="text-sm text-neutral-400 max-w-md">
                            I have read and agree to the partnership terms, including the contribution-based profit distribution logic.
                        </p>
                    </div>

                    <button
                        disabled={!signed}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${signed ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/20 active:scale-95' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}`}
                    >
                        Digital Signature & Acceptance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-xs text-neutral-400">Secured via SHA-256 Hash</p>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                        <CheckCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-xs text-neutral-400">Immutable Audit Trail</p>
                </div>
                <div className="glass-card p-4 flex items-center gap-4 text-neutral-500 cursor-not-allowed">
                    <Clock className="w-5 h-5" />
                    <p className="text-xs italic">View Signature History (Admin Only)</p>
                </div>
            </div>
        </div>
    );
}
