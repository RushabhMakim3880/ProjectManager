"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
    Send, CheckCircle2, Loader2, ArrowLeft, Check, Search, FileText, Info, Trash2,
    Globe, Smartphone, Layout, Megaphone, LineChart, Palette, Terminal, Braces, Github, 
    FileSearch, Target, Database, Cpu, Network, Shield, Zap, Layers, Rocket, Box, Cloud, Code2,
    HelpCircle
} from 'lucide-react';
import { PROJECT_SERVICES, ProjectService } from '@/lib/project-types';

const IconMap: Record<string, any> = {
    Globe, Smartphone, Layout, Megaphone, LineChart, Palette, Terminal, Braces, Github, Search, 
    FileSearch, Target, Database, Cpu, Network, Shield, Zap, Layers, Rocket, Box, Cloud, Code2
};

export default function InternalEnquiryForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        clientName: '',
        companyName: '',
        email: '',
        phone: '',
        country: '',
        servicesRequested: [] as string[],
        projectDescription: '',
        timeline: '',
        budgetRange: '',
        discoverySource: '',
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            servicesRequested: prev.servicesRequested.includes(service)
                ? prev.servicesRequested.filter(s => s !== service)
                : [...prev.servicesRequested, service]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientName || !formData.email) {
            setError('Please fill in the Client Name and Email.');
            return;
        }
        if (formData.servicesRequested.length === 0) {
            setError('Please select at least one service from the scope.');
            return;
        }
        if (!formData.projectDescription) {
            setError('Please provide an initial project brief.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, formData);
            setSuccess(true);
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMessage = typeof errorData === 'string' 
                ? errorData 
                : errorData?.message || errorData?.error || 'An error occurred while logging the enquiry.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800 p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl relative z-10">
                    <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                        <CheckCircle2 className="w-12 h-12 relative z-10" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Enquiry Logged!</h2>
                    <p className="text-neutral-400 mb-10 text-lg leading-relaxed">
                        The new lead has been successfully recorded in the CRM pipeline and is ready for discovery.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => { setSuccess(false); setFormData({ clientName: '', companyName: '', email: '', phone: '', country: '', servicesRequested: [], projectDescription: '', timeline: '', budgetRange: '', discoverySource: '' }); }}
                            className="w-full px-8 py-4 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-lg transition-colors shadow-lg"
                        >
                            Log Another Enquiry
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/enquiries')}
                            className="w-full px-8 py-4 bg-transparent border border-neutral-700 hover:bg-neutral-800 text-white font-semibold rounded-xl text-lg transition-colors"
                        >
                            Return to Pipeline
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f16] flex flex-col py-16 px-4 md:px-8 font-sans relative overflow-x-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

            <button
                onClick={() => router.back()}
                className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all z-50 shadow-lg group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Cancel & Return</span>
            </button>

            <div className="max-w-4xl mx-auto w-full relative z-10 mt-12 md:mt-2">
                <div className="mb-10">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-5 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        Internal Sales Tool
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Log New <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">Enquiry</span>
                    </h1>
                    <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
                        Create a project lead entry directly in the CRM pipeline to bypass the public discovery funnels.
                    </p>
                </div>

                <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-neutral-800/50">
                        {error && (
                            <div className="p-6 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                {typeof error === 'string' ? error : 'An unexpected error occurred'}
                            </div>
                        )}

                        <div className="p-8 md:p-10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-300 flex items-center justify-center text-sm font-bold">1</div>
                                <h3 className="text-xl font-bold text-white">Client Details</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-11">
                                <div className="space-y-2">
                                    <label htmlFor="clientName" className="block text-sm font-medium text-neutral-300">Contact Name *</label>
                                    <input type="text" id="clientName" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="e.g. John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-300">Email Address *</label>
                                    <input type="email" id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="john@company.com" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="companyName" className="block text-sm font-medium text-neutral-300">Company Name</label>
                                    <input type="text" id="companyName" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="e.g. Acme Corp" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-300">Phone Number</label>
                                    <input type="tel" id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="+1..." />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 bg-black/20">
                            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-300 flex items-center justify-center text-sm font-bold text-[#256af4]">2</div>
                                    <h3 className="text-xl font-bold text-white">Project Scope</h3>
                                </div>
                                
                                <div className="relative w-full md:w-72 group">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#256af4] transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search services..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:border-[#256af4]/50 focus:ring-1 focus:ring-[#256af4]/50 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 pl-0 md:pl-11">
                                <div className="flex-grow space-y-10">
                                    {Object.entries(PROJECT_SERVICES).map(([domain, services]) => {
                                        const filtered = services.filter(s => 
                                            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            s.description.toLowerCase().includes(searchQuery.toLowerCase())
                                        );
                                        if (searchQuery && filtered.length === 0) return null;
                                        
                                        return (
                                            <div key={domain} className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-[12px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
                                                        {domain}
                                                    </h4>
                                                    <div className="h-[1px] flex-grow bg-neutral-800/50"></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {filtered.map((service) => {
                                                        const isSelected = formData.servicesRequested.includes(service.id);
                                                        const IconComponent = IconMap[service.icon] || HelpCircle;
                                                        
                                                        return (
                                                            <div 
                                                                key={service.id} 
                                                                onClick={() => toggleService(service.id)}
                                                                className={`relative group p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col gap-4 h-full ${
                                                                    isSelected 
                                                                    ? 'bg-[#256af4]/10 border-[#256af4]/50 shadow-[0_0_20px_rgba(37,106,244,0.15)] ring-1 ring-[#256af4]/20' 
                                                                    : 'bg-black/30 border-neutral-800/80 hover:border-neutral-700 hover:bg-black/50'
                                                                }`}
                                                            >
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 border border-[#256af4]/30 rounded-2xl blur-sm pointer-events-none animate-pulse"></div>
                                                                )}
                                                                
                                                                <div className="flex items-start justify-between relative z-10">
                                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                                        isSelected 
                                                                        ? 'bg-[#256af4] text-white shadow-[0_0_15px_rgba(37,106,244,0.4)]' 
                                                                        : 'bg-neutral-800/50 text-neutral-500 group-hover:text-neutral-300 group-hover:bg-neutral-800'
                                                                    }`}>
                                                                        <IconComponent className="w-6 h-6" />
                                                                    </div>
                                                                    
                                                                    <div className="flex flex-col items-end gap-2">
                                                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                                                            isSelected 
                                                                            ? 'bg-[#256af4] border-[#256af4] text-white' 
                                                                            : 'border-neutral-700 bg-black/20 text-transparent'
                                                                        }`}>
                                                                            <Check className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        {isSelected && (
                                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#256af4]/20 border border-[#256af4]/30">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#256af4] animate-pulse"></span>
                                                                                <span className="text-[10px] font-bold text-[#256af4] uppercase tracking-wider">Active</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1.5 relative z-10">
                                                                    <h5 className={`text-base font-bold transition-colors ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                                                                        {service.name}
                                                                    </h5>
                                                                    <p className={`text-sm leading-relaxed transition-colors line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500 group-hover:text-neutral-400'}`}>
                                                                        {service.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {searchQuery && Object.values(PROJECT_SERVICES).every(services => 
                                        services.filter(s => 
                                            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            s.description.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length === 0
                                    ) && (
                                        <div className="py-12 text-center bg-neutral-900/20 rounded-3xl border border-dashed border-neutral-800">
                                            <Search className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
                                            <p className="text-neutral-500 font-medium">No services found matching "{searchQuery}"</p>
                                            <button 
                                                onClick={() => setSearchQuery('')}
                                                className="mt-4 text-[#256af4] text-sm font-semibold hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Summary Sidebar */}
                                <div className="w-full lg:w-72 flex-shrink-0">
                                    <div className="sticky top-24 space-y-4">
                                        <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#256af4]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#256af4]/10 transition-colors"></div>
                                            
                                            <div className="flex items-center gap-2 mb-6">
                                                <FileText className="w-4 h-4 text-[#256af4]" />
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Scope Summary</h4>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Selected Items</p>
                                                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                                                        {formData.servicesRequested.length}
                                                        <span className="text-sm font-normal text-neutral-500 font-sans tracking-normal">units</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-neutral-800/80">
                                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                        {formData.servicesRequested.length > 0 ? (
                                                            formData.servicesRequested.map((serviceId) => {
                                                                const serviceEntry = Object.values(PROJECT_SERVICES).flat().find(s => s.id === serviceId);
                                                                return (
                                                                    <div key={serviceId} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 border border-neutral-800/50 group/item hover:border-red-900/30 transition-all">
                                                                        <span className="text-[12px] text-neutral-300 leading-tight">
                                                                            {serviceEntry?.name || serviceId}
                                                                        </span>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => toggleService(serviceId)}
                                                                            className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover/item:opacity-100 transition-all"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
                                                                <Info className="w-6 h-6 mb-2" />
                                                                <p className="text-[11px] uppercase tracking-widest font-bold">No items selected</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                            <p className="text-[11px] text-indigo-400/80 leading-relaxed italic">
                                                Select services from the grid to build the project scope in real-time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-300 flex items-center justify-center text-sm font-bold">3</div>
                                <h3 className="text-xl font-bold text-white">Logistics & Source</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pl-0 md:pl-11">
                                <div className="space-y-2">
                                    <label htmlFor="timeline" className="block text-sm font-medium text-neutral-300">Expected Timeline</label>
                                    <select id="timeline" value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
                                        <option value="" className="bg-neutral-900">Select timeframe</option>
                                        <option value="Immediately" className="bg-neutral-900">Immediately</option>
                                        <option value="1-2 Weeks" className="bg-neutral-900">1-2 Weeks</option>
                                        <option value="1 Month" className="bg-neutral-900">1 Month</option>
                                        <option value="3+ Months" className="bg-neutral-900">3+ Months</option>
                                        <option value="TBD" className="bg-neutral-900">TBD</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="budgetRange" className="block text-sm font-medium text-neutral-300">Indicated Budget</label>
                                    <select id="budgetRange" value={formData.budgetRange} onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
                                        <option value="" className="bg-neutral-900">Select range</option>
                                        <option value="Under $5,000" className="bg-neutral-900">Under $5k</option>
                                        <option value="$5,000 - $10,000" className="bg-neutral-900">$5k - $10k</option>
                                        <option value="$10,000 - $25,000" className="bg-neutral-900">$10k - $25k</option>
                                        <option value="$25,000+" className="bg-neutral-900">$25k+</option>
                                        <option value="TBD" className="bg-neutral-900">TBD</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="discoverySource" className="block text-sm font-medium text-neutral-300">Lead Source</label>
                                    <select id="discoverySource" value={formData.discoverySource} onChange={(e) => setFormData({ ...formData, discoverySource: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
                                        <option value="" className="bg-neutral-900">Select an option</option>
                                        <option value="Inbound - Website" className="bg-neutral-900">Inbound - Website</option>
                                        <option value="Outbound - Cold Email" className="bg-neutral-900">Outbound - Cold Email</option>
                                        <option value="LinkedIn" className="bg-neutral-900">LinkedIn</option>
                                        <option value="Referral / Word of Mouth" className="bg-neutral-900">Referral / Word of Mouth</option>
                                        <option value="Clutch / Review Site" className="bg-neutral-900">Clutch / Review Site</option>
                                        <option value="Other" className="bg-neutral-900">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 bg-black/20">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-300 flex items-center justify-center text-sm font-bold">4</div>
                                <h3 className="text-xl font-bold text-white">Initial Brief & Notes</h3>
                            </div>

                            <div className="pl-0 md:pl-11">
                                <label htmlFor="projectDescription" className="sr-only">Initial Brief / Notes</label>
                                <textarea id="projectDescription" rows={4} value={formData.projectDescription} onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })} className="w-full rounded-2xl bg-black/40 border border-neutral-800 px-5 py-4 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all outline-none" placeholder="Add context, known requirements, or any notes from initial conversations..." />
                            </div>
                        </div>

                        <div className="p-8 md:p-10 flex justify-end items-center bg-black/40">
                            <button type="submit" disabled={loading} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                {loading ? ( <><Loader2 className="w-5 h-5 animate-spin" />Saving to CRM...</> ) : ( <><Send className="w-5 h-5" />Log Enquiry to Pipeline</> )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
