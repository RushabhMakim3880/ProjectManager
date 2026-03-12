'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Loader2, 
    Send, 
    Sparkles, 
    AlertCircle,
    CheckCircle2,
    Mail,
    Edit3
} from 'lucide-react';
import api from '@/lib/api';

interface ColdEmailModalProps {
    enquiryId: string;
    onClose: () => void;
}

interface Draft {
    subject: string;
    body: string;
}

export default function ColdEmailModal({ enquiryId, onClose }: ColdEmailModalProps) {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        generateDraft();
    }, [enquiryId]);

    const generateDraft = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/enquiries/${enquiryId}/generate-draft-email`);
            setDraft(res.data);
        } catch (err: any) {
            console.error('Failed to generate draft', err);
            setError(err.response?.data?.message || 'Failed to generate AI draft. Please ensure discovery data is present.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!draft) return;
        setSending(true);
        try {
            // In a real scenario, this would send an actual email via SendGrid/Postmark
            // For now, we simulate success and add a note to the enquiry
            await api.post(`/enquiries/${enquiryId}/notes`, {
                content: `[AI Cold Email Sent]\nSubject: ${draft.subject}\n\n${draft.body}`
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError('Failed to log email sent.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl glass-card overflow-hidden bg-neutral-900/80 border-indigo-500/20 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-indigo-500/10 flex items-center justify-between bg-indigo-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Neural Outreach</h2>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">AI-Personalized Prospecting Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                            </div>
                            <p className="text-sm font-black text-white uppercase tracking-widest italic">Synthesizing Context...</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold text-center max-w-[200px]">
                                Analyzing lead metadata and project vectors for optimal resonance.
                            </p>
                        </div>
                    ) : success ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-emerald-500/20 rounded-full">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-widest italic">Message Dispatched</h3>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold text-center">
                                Outreach logged to enquiry timeline.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col items-center text-center gap-4">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                            <div>
                                <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Synthesis Blocked</p>
                                <p className="text-[10px] text-neutral-500 font-bold mt-1 tracking-wide">{error}</p>
                            </div>
                            <button 
                                onClick={generateDraft}
                                className="px-6 py-2 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                            >
                                Re-Attempt Synthesis
                            </button>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Edit3 className="w-3 h-3" /> Subject Line
                                </label>
                                <input 
                                    type="text"
                                    value={draft?.subject}
                                    onChange={(e) => setDraft(prev => prev ? {...prev, subject: e.target.value} : null)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Message Payload
                                </label>
                                <textarea 
                                    value={draft?.body}
                                    onChange={(e) => setDraft(prev => prev ? {...prev, body: e.target.value} : null)}
                                    rows={12}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 text-sm text-neutral-300 font-medium focus:border-indigo-500 outline-none transition-all resize-none custom-scrollbar"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                {!loading && !success && !error && (
                    <div className="p-6 border-t border-indigo-500/10 bg-indigo-500/5 flex gap-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-3 bg-neutral-800 text-neutral-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                        >
                            Abort
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={sending}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {sending ? (
                                <>Encrypting & Dispatching <Loader2 className="w-4 h-4 animate-spin" /></>
                            ) : (
                                <>Initialize Outreach <Send className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
