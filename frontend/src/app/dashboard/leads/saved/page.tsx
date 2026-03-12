"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Target, 
    Mail, 
    Send, 
    Zap, 
    ChevronRight, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    Globe, 
    Building2,
    Sparkles,
    FileText,
    History,
    ArrowUpRight,
    Users,
    MousePointer2,
    Search,
    Filter,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Lead {
    id: string;
    name: string;
    website: string;
    email: string | null;
    status: string;
    fitScore: number;
    suggestedServices: string[];
    fitReasoning: string | null;
    createdAt: string;
}

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category?: string;
}

export default function OutreachManagerPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [leadsRes, templatesRes] = await Promise.all([
                api.get('/leads/saved'),
                api.get('/leads/templates')
            ]);

            // Combine API leads with sessionStorage leads
            const apiLeads = leadsRes.data || [];
            const savedStr = sessionStorage.getItem('saved_leads');
            const localLeads = savedStr ? JSON.parse(savedStr) : [];
            
            const uniqueLeads = [...apiLeads];
            localLeads.forEach((localLead: any) => {
                if (!uniqueLeads.find((l: any) => l.website === localLead.website)) {
                    uniqueLeads.push(localLead);
                }
            });

            setLeads(uniqueLeads);
            setTemplates(templatesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to synchronize data with the intelligence hub');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateEmail = async () => {
        if (!selectedLead || !selectedTemplate) {
            toast.error('Select target and communication vector first');
            return;
        }

        try {
            setIsGenerating(true);
            const response = await api.post('/leads/generate-email', {
                leadId: selectedLead.id,
                leadData: selectedLead,
                templateId: selectedTemplate.id
            });

            setGeneratedEmail(response.data);
            toast.success('AI Draft Generated Successfully');
        } catch (error) {
            console.error('Error generating email:', error);
            toast.error('Nerve-link failed during draft generation');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendEmail = async () => {
        if (!selectedLead || !generatedEmail) return;

        try {
            setIsSending(true);
            await api.post('/leads/send-email', {
                leadId: selectedLead.id,
                subject: generatedEmail.subject,
                body: generatedEmail.body
            });
            
            toast.success('Electronic Communication Dispatched');
            setGeneratedEmail(null);
            fetchInitialData(); // Refresh to show CONTACTED status
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Transmission failure detected');
        } finally {
            setIsSending(false);
        }
    };

    const handlePromote = async (leadId: string) => {
        try {
            setIsPromoting(true);
            await api.post(`/leads/promote/${leadId}`);

            toast.success('Target Promoted to Active CRM Pipeline');
            fetchInitialData();
            if (selectedLead?.id === leadId) setSelectedLead(null);
        } catch (error) {
            console.error('Error promoting:', error);
            toast.error('Command Bridge rejected promotion request');
        } finally {
            setIsPromoting(false);
        }
    };

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.website.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 pb-24 space-y-8 max-w-[1600px] mx-auto text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                            <Target className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Outreach Manager</h1>
                    </div>
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History className="w-3 h-3" /> System Logs: {leads.length} Verified Targets In Queue
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="SEARCH VECTORS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        <Filter className="w-4 h-4 text-neutral-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
                {/* Leads Sidebar */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                            ))
                        ) : filteredLeads.map((lead) => (
                            <motion.div
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                                    selectedLead?.id === lead.id 
                                    ? 'bg-indigo-600 border-indigo-400/50 shadow-[0_0_30px_rgba(79,70,229,0.3)]' 
                                    : 'bg-neutral-900/40 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${
                                            lead.status === 'CONTACTED' 
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        }`}>
                                            {lead.status}
                                        </div>
                                        <div className="text-[10px] font-black italic opacity-50 group-hover:opacity-100">{lead.fitScore}% FIT</div>
                                    </div>
                                    <h3 className="font-black uppercase tracking-tight text-sm mb-1 truncate">{lead.name}</h3>
                                    <p className="text-[10px] text-neutral-500 font-bold truncate mb-3">{lead.website}</p>
                                    
                                    <div className="flex gap-2">
                                        {lead.suggestedServices.slice(0, 2).map((s, i) => (
                                            <span key={i} className="text-[7px] font-black bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {selectedLead?.id === lead.id && (
                                    <motion.div 
                                        layoutId="active-indicator"
                                        className="absolute inset-0 bg-gradient-to-br from-indigo-600/50 to-transparent"
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Lead Detail & Email Composer */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {!selectedLead ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full glass-card bg-neutral-900/20 border-white/5 flex flex-col items-center justify-center gap-6"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                                    <MousePointer2 className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Initialize Target</h3>
                                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-2 max-w-xs">
                                        Select a verified vector from the intelligence log to begin communication sequence.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full grid grid-cols-12 gap-8"
                            >
                                {/* Target View */}
                                <div className="col-span-12 lg:col-span-4 h-full flex flex-col gap-6">
                                    <div className="glass-card bg-neutral-900/40 border-white/5 p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px]" />
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <Building2 className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black uppercase tracking-tight italic">{selectedLead.name}</h2>
                                                    <a href={selectedLead.website} target="_blank" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                                                        {selectedLead.website} <ArrowUpRight className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Fit Index</div>
                                                    <div className="text-xl font-black italic text-indigo-400">{selectedLead.fitScore}%</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Status</div>
                                                    <div className="text-xs font-black uppercase italic tracking-tighter text-emerald-400">{selectedLead.status}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-3 flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-indigo-500" /> Strategic Analysis
                                                    </h4>
                                                    <p className="text-xs text-neutral-400 font-medium leading-relaxed italic border-l-2 border-indigo-500/20 pl-4 py-1">
                                                        "{selectedLead.fitReasoning}"
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-3">Service Vectors</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedLead.suggestedServices.map(s => (
                                                            <span key={s} className="text-[9px] font-black bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded text-indigo-300 uppercase tracking-widest">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bridge */}
                                    <div className="glass-card bg-neutral-900/40 border-white/5 p-6 space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-600 text-center">Pipeline Integration</h4>
                                        <button 
                                            onClick={() => handlePromote(selectedLead.id)}
                                            disabled={isPromoting || selectedLead.status === 'CONVERTED'}
                                            className="w-full group relative flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-4 transition-all overflow-hidden disabled:opacity-50"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-600/10 to-emerald-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                            {isPromoting ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Zap className="w-4 h-4 text-emerald-400" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">Promote to Executive Pipeline</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Email Interface */}
                                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
                                    {/* Template Selection */}
                                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                        {templates.map(tmp => (
                                            <button
                                                key={tmp.id}
                                                onClick={() => {
                                                    setSelectedTemplate(tmp);
                                                    setGeneratedEmail(null);
                                                }}
                                                className={`flex-shrink-0 px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    selectedTemplate?.id === tmp.id
                                                    ? 'bg-indigo-600 border-indigo-400 shadow-lg'
                                                    : 'bg-neutral-900/60 border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                {tmp.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Composer */}
                                    <div className="flex-1 glass-card bg-neutral-900/40 border-white/5 flex flex-col overflow-hidden">
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Electronic Communication Module</span>
                                            </div>
                                            {selectedTemplate && !generatedEmail && (
                                                <button 
                                                    onClick={handleGenerateEmail}
                                                    disabled={isGenerating}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                >
                                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                    Empower with A.I.
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                            {generatedEmail ? (
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Subject Line</label>
                                                        <input 
                                                            type="text" 
                                                            value={generatedEmail.subject}
                                                            onChange={(e) => setGeneratedEmail({...generatedEmail, subject: e.target.value})}
                                                            className="w-full bg-white/5 border border-white/5 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-indigo-500/50"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Transmitted Payload</label>
                                                        <textarea 
                                                            value={generatedEmail.body}
                                                            onChange={(e) => setGeneratedEmail({...generatedEmail, body: e.target.value})}
                                                            rows={15}
                                                            className="w-full bg-white/5 border border-white/5 rounded-lg py-4 px-4 text-xs font-medium leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none font-serif text-neutral-300"
                                                        />
                                                    </div>
                                                </div>
                                            ) : isGenerating ? (
                                                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 border-b-2 border-indigo-500 rounded-full animate-spin" />
                                                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 animate-pulse">Calculating Engagement Vectors...</p>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-neutral-600">
                                                    <Mail className="w-12 h-12 stroke-[1] mb-2" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Communication Sequence Initialization</p>
                                                </div>
                                            )}
                                        </div>

                                        {generatedEmail && (
                                            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-4">
                                                <button 
                                                    onClick={() => setGeneratedEmail(null)}
                                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
                                                >
                                                    Abort Draft
                                                </button>
                                                <button 
                                                    onClick={handleSendEmail}
                                                    disabled={isSending}
                                                    className="flex items-center gap-3 px-10 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50"
                                                >
                                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                    Engage Target
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Visual enhancements */}
            <div className="fixed top-0 right-0 w-1/3 h-screen bg-indigo-600/5 blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-0 w-1/4 h-screen bg-indigo-600/5 blur-[120px] pointer-events-none -z-10" />
        </div>
    );
}
