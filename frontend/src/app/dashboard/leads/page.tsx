'use client';

import React, { useState } from 'react';
import { 
    Search, 
    Globe, 
    Target, 
    Zap, 
    ShieldCheck, 
    TrendingUp, 
    Loader2, 
    Plus, 
    ExternalLink, 
    AlertCircle,
    CheckCircle2,
    Radar,
    ChevronRight,
    SearchCode,
    Sparkles,
    Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function LeadHunterPage() {
    const [searching, setSearching] = useState(false);
    const [importing, setImporting] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);
    const [query, setQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lh_query');
            return saved ? JSON.parse(saved) : { niche: '', location: '' };
        }
        return { niche: '', location: '' };
    });
    const [leads, setLeads] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lh_leads');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [existingStatus, setExistingStatus] = useState<Record<string, { exists: boolean, status?: string }>>({});
    const [hasSearched, setHasSearched] = useState(() => {
        if (typeof window !== 'undefined') return !!localStorage.getItem('lh_leads');
        return false;
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.niche) return;

        setSearching(true);
        setHasSearched(true);
        setLeads([]);
        localStorage.removeItem('lh_leads');
        try {
            const response = await api.post('/leads/search', query);
            const discoveredLeads = response.data;
            setLeads(discoveredLeads);
            localStorage.setItem('lh_leads', JSON.stringify(discoveredLeads));
            localStorage.setItem('lh_query', JSON.stringify(query));
            
            // Check duplicates (non-blocking)
            try {
                const websites = discoveredLeads.map((l: any) => l.website).filter(Boolean);
                if (websites.length > 0) {
                    const checkRes = await api.post('/leads/check-duplicates', { websites });
                    const statusMap: Record<string, any> = {};
                    checkRes.data.forEach((item: any) => { statusMap[item.website] = item; });

                    // Also check localStorage
                    const savedStr = localStorage.getItem('saved_leads');
                    if (savedStr) {
                        const savedLeads = JSON.parse(savedStr);
                        savedLeads.forEach((l: any) => {
                            if (websites.includes(l.website)) {
                                statusMap[l.website] = { exists: true, status: l.status };
                            }
                        });
                    }

                    setExistingStatus(statusMap);
                }
            } catch { /* duplicate check is non-critical */ }
            
            toast.success(`Found ${discoveredLeads.length} qualified targets.`);
        } catch (error) {
            console.error('Lead search failed', error);
            toast.error('Tactical discovery failed. Check network link.');
        } finally {
            setSearching(false);
        }
    };

    const handleSaveToDB = async (lead: any) => {
        setSaving(lead.website);
        try {
            await api.post('/leads/save', lead);
            
            // Fallback for Vercel: save to localStorage
            const savedStr = localStorage.getItem('saved_leads');
            const savedLeads = savedStr ? JSON.parse(savedStr) : [];
            const newLead = { ...lead, id: `local-${Date.now()}`, status: 'DISCOVERED', createdAt: new Date().toISOString() };
            if (!savedLeads.find((l: any) => l.website === lead.website)) {
                savedLeads.push(newLead);
                localStorage.setItem('saved_leads', JSON.stringify(savedLeads));
            }

            setExistingStatus(prev => ({
                ...prev,
                [lead.website]: { exists: true, status: 'DISCOVERED' }
            }));
            toast.success(`${lead.name} saved to outreach database.`);
        } catch (error) {
            toast.error('Failed to save to database.');
        } finally {
            setSaving(null);
        }
    };

    const handleImport = async (lead: any) => {
        setImporting(lead.name);
        try {
            await api.post('/leads/import', lead);

            // Fallback for Vercel: save to localStorage
            const savedStr = localStorage.getItem('saved_leads');
            const savedLeads = savedStr ? JSON.parse(savedStr) : [];
            const newLead = { ...lead, id: `local-${Date.now()}`, status: 'CONVERTED', createdAt: new Date().toISOString() };
            if (!savedLeads.find((l: any) => l.website === lead.website)) {
                savedLeads.push(newLead);
                localStorage.setItem('saved_leads', JSON.stringify(savedLeads));
            } else {
                const target = savedLeads.find((l: any) => l.website === lead.website);
                target.status = 'CONVERTED';
                localStorage.setItem('saved_leads', JSON.stringify(savedLeads));
            }

            toast.success(`${lead.name} successfully integrated into CRM.`);
            setExistingStatus(prev => ({
                ...prev,
                [lead.website]: { exists: true, status: 'CONVERTED' }
            }));
        } catch (error) {
            console.error('Import failed', error);
            toast.error('failed to bridge lead to CRM.');
        } finally {
            setImporting(null);
        }
    };

    return (
        <div className="flex-1 p-8 bg-[#050505] min-h-screen text-white overflow-y-auto">
            {/* Header section with Radar animation */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                <Radar className="w-5 h-5 text-indigo-400" />
                            </div>
                            {searching && (
                                <motion.div 
                                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 bg-indigo-500 rounded-lg"
                                />
                            )}
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Lead Hunter</h1>
                    </div>
                    <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                        AI-powered reconnaissance for high-value operational targets.
                    </p>
                </div>

                <div className="hidden lg:flex gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Scanned Vectors</span>
                        <span className="text-xl font-black italic">1,248</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Conversion Hit-rate</span>
                        <span className="text-xl font-black italic text-emerald-400">12.4%</span>
                    </div>
                </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mb-12">
                <div className="bg-neutral-900/40 p-2 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative group">
                        <SearchCode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="NICHE (e.g., Fintech, Real Estate)"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-700"
                            value={query.niche}
                            onChange={(e) => setQuery({ ...query, niche: e.target.value })}
                        />
                    </div>
                    <div className="w-full md:w-64 relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="LOCATION (Optional)"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-700"
                            value={query.location}
                            onChange={(e) => setQuery({ ...query, location: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/dashboard/leads/saved"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 rounded-xl font-black uppercase italic tracking-tighter text-[10px] flex items-center justify-center gap-2 transition-all h-[52px]"
                        >
                            <Mail className="w-4 h-4 text-indigo-400" />
                            Intelligence Log
                        </Link>
                        <button 
                            disabled={searching || !query.niche}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-600 px-8 rounded-xl font-black uppercase italic tracking-tighter text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(79,70,229,0.3)] h-[52px]"
                        >
                            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                            Execute Scan
                        </button>
                    </div>
                </div>
            </form>

            <AnimatePresence mode="wait">
                {searching ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-24 gap-6"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Analyzing Vectors</h3>
                            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest max-w-[280px]">
                                Cross-referencing global market clusters and qualifying digital footprints...
                            </p>
                        </div>
                    </motion.div>
                ) : leads.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {leads.map((lead, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`glass-card bg-neutral-900/40 border-white/5 p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col h-full ${existingStatus[lead.website]?.exists ? 'opacity-80' : ''}`}
                            >
                                <div className="absolute top-0 right-0 p-4 flex gap-2">
                                    {existingStatus[lead.website]?.exists && (
                                        <div className={`text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400`}>
                                            {existingStatus[lead.website].status || 'REGISTERED'}
                                        </div>
                                    )}
                                    <div className={`text-[10px] font-black p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex flex-col items-center`}>
                                        <span className="text-neutral-500 leading-none mb-1">FIT</span>
                                        <span className={`text-sm italic leading-none ${lead.fitScore >= 75 ? 'text-emerald-400' : lead.fitScore >= 50 ? 'text-indigo-400' : 'text-neutral-500'}`}>{lead.fitScore}%</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                                            <Target className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <h3 className="font-black italic uppercase tracking-tight text-lg group-hover:text-indigo-400 transition-colors line-clamp-1">{lead.name}</h3>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex gap-2 flex-wrap">
                                            {lead.suggestedServices.map((service: string) => (
                                                <span key={service} className="text-[8px] font-black bg-white/5 border border-white/5 px-2 py-1 rounded uppercase tracking-widest text-neutral-400 group-hover:border-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium leading-relaxed italic">
                                            "{lead.fitReasoning}"
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex gap-3">
                                    {existingStatus[lead.website]?.exists ? (
                                        <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" /> Target Acquired
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleSaveToDB(lead)}
                                            disabled={saving === lead.website}
                                            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            {saving === lead.website ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="w-3 h-3" />
                                            )}
                                            Track Target
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleImport(lead)}
                                        disabled={importing === lead.name || existingStatus[lead.website]?.status === 'CONVERTED'}
                                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {importing === lead.name ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Zap className="w-3 h-3" />
                                        )}
                                        {existingStatus[lead.website]?.status === 'CONVERTED' ? 'In CRM' : 'Instant Bridge'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-neutral-500">
                        <AlertCircle className="w-12 h-12 stroke-[1]" />
                        <div className="text-center">
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Zero Targets Identified</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Refine search parameters and re-scan the vector.</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
                        <div className="glass-card p-8 bg-neutral-900/20 border-white/5">
                            <Zap className="w-8 h-8 text-yellow-400 mb-6" />
                            <h3 className="text-lg font-black italic uppercase tracking-tighter mb-3">Precision Scoping</h3>
                            <p className="text-xs text-neutral-500 leading-relaxed font-bold uppercase tracking-wide">
                                Our AI vector analysis identifies businesses failing basic security benchmarks or running legacy web infrastructure.
                            </p>
                        </div>
                        <div className="glass-card p-8 bg-neutral-900/20 border-white/5">
                            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-6" />
                            <h3 className="text-lg font-black italic uppercase tracking-tighter mb-3">Direct Integration</h3>
                            <p className="text-xs text-neutral-500 leading-relaxed font-bold uppercase tracking-wide">
                                Seamlessly bridge qualified targets into your CRM pipeline with pre-filled discovery data and service suggestions.
                            </p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
