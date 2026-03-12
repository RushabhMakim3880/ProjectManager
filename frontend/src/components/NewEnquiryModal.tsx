"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { 
    X, Send, CheckCircle2, Loader2, ArrowLeft, Check, Search, FileText, Info, Trash2,
    Globe, Smartphone, Layout, Megaphone, LineChart, Palette, Terminal, Braces, Github, 
    FileSearch, Target, Database, Cpu, Network, Shield, Zap, Layers, Rocket, Box, Cloud, Code2,
    HelpCircle, User, Building2, Mail, Phone, MapPin, Calendar, Clock, DollarSign, Lightbulb, Plus
} from 'lucide-react';
import { PROJECT_SERVICES, ProjectService } from '@/lib/project-types';

const IconMap: Record<string, any> = {
    Globe, Smartphone, Layout, Megaphone, LineChart, Palette, Terminal, Braces, Github, Search, 
    FileSearch, Target, Database, Cpu, Network, Shield, Zap, Layers, Rocket, Box, Cloud, Code2
};

interface NewEnquiryModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
    isEdit?: boolean;
}

export default function NewEnquiryModal({ onClose, onSuccess, initialData, isEdit }: NewEnquiryModalProps) {
    const [formData, setFormData] = useState({
        clientName: initialData?.clientName || '',
        companyName: initialData?.companyName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        country: initialData?.country || '',
        servicesRequested: initialData?.servicesRequested || [] as string[],
        projectDescription: initialData?.projectDescription || '',
        timeline: initialData?.timeline || '',
        budgetRange: initialData?.budgetRange?.toString() || '',
        discoverySource: initialData?.discoverySource || '',
    });

    const [customTimeline, setCustomTimeline] = useState({ value: '', unit: 'Days' });
    const [isCustomTimeline, setIsCustomTimeline] = useState(false);
    const [customService, setCustomService] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Pre-populate custom timeline if editing existing custom timeline
    React.useEffect(() => {
        if (isEdit && initialData?.timeline) {
            const parts = initialData.timeline.split(' ');
            if (parts.length === 2 && ['Days', 'Weeks', 'Months'].includes(parts[1])) {
                setCustomTimeline({ value: parts[0], unit: parts[1] });
                setIsCustomTimeline(true);
            }
        }
    }, [isEdit, initialData]);

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            servicesRequested: prev.servicesRequested.includes(service)
                ? prev.servicesRequested.filter((s: string) => s !== service)
                : [...prev.servicesRequested, service]
        }));
    };

    const addCustomService = () => {
        if (!customService.trim()) return;
        if (!formData.servicesRequested.includes(customService.trim())) {
            setFormData(prev => ({
                ...prev,
                servicesRequested: [...prev.servicesRequested, customService.trim()]
            }));
        }
        setCustomService('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientName) {
            setError('Please fill in the Client Name.');
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

        const finalTimeline = isCustomTimeline ? `${customTimeline.value} ${customTimeline.unit}` : formData.timeline;
        const submitData = { 
            ...formData, 
            timeline: finalTimeline,
            budgetRange: formData.budgetRange === 'TBD' ? 'TBD' : parseInt(formData.budgetRange) || 0
        };

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (isEdit && initialData?.id) {
                await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${initialData.id}`, submitData, config);
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, submitData, config);
            }
            
            setSuccess(true);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMessage = typeof errorData === 'string' 
                ? errorData 
                : errorData?.message || errorData?.error || 'An error occurred while saving the enquiry.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id || !confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${initialData.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMessage = typeof errorData === 'string' 
                ? errorData 
                : errorData?.message || errorData?.error || 'Failed to delete enquiry';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                        <CheckCircle2 className="w-12 h-12 relative z-10" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                        {isEdit ? 'Enquiry Updated!' : 'Enquiry Logged!'}
                    </h2>
                    <p className="text-neutral-400 mb-10 text-lg leading-relaxed">
                        {isEdit 
                            ? 'The changes have been successfully saved to the CRM pipeline.'
                            : 'The new lead has been successfully recorded in the CRM pipeline and is ready for discovery.'}
                    </p>
                    <div className="space-y-4">
                        {!isEdit && (
                            <button
                                onClick={() => { 
                                    setSuccess(false); 
                                    setFormData({ clientName: '', companyName: '', email: '', phone: '', country: '', servicesRequested: [], projectDescription: '', timeline: '', budgetRange: '', discoverySource: '' }); 
                                }}
                                className="w-full px-8 py-4 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-lg transition-colors shadow-lg"
                            >
                                Log Another Enquiry
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full px-8 py-4 bg-transparent border border-neutral-700 hover:bg-neutral-800 text-white font-semibold rounded-xl text-lg transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-6xl h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Plus className="w-6 h-6 text-indigo-400" />
                        </div>
                         <div>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">{isEdit ? 'Edit Enquiry' : 'Log New Enquiry'}</h2>
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-[0.2em] mt-0.5">Internal Sales Discovery Tool</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} id="enquiry-form">
                        {error && (
                            <div className="mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                {typeof error === 'string' ? error : 'An unexpected error occurred'}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                            {/* Form Left Side */}
                            <div className="lg:col-span-2 p-8 space-y-12">
                                {/* Section 1: Client Details */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 flex items-center justify-center text-xs font-bold">01</div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Client Context</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <User className="w-3 h-3" /> Contact Name *
                                            </label>
                                            <input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="e.g. John Doe" />
                                        </div>
                                         <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Mail className="w-3 h-3" /> Email Address (Optional)
                                            </label>
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="john@company.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Building2 className="w-3 h-3" /> Company Name
                                            </label>
                                            <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="Acme Corp" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Phone Number
                                            </label>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl bg-black/40 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none" placeholder="+1..." />
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Project Scope */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 flex items-center justify-center text-xs font-bold">02</div>
                                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Project Scope</h3>
                                        </div>
                                        <div className="relative w-64 group">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="Search services..." 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-4 py-2 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:border-indigo-500/50 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pl-11 space-y-10">
                                        {Object.entries(PROJECT_SERVICES).map(([domain, services]) => {
                                            const filtered = services.filter(s => 
                                                s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                s.description.toLowerCase().includes(searchQuery.toLowerCase())
                                            );
                                            if (searchQuery && filtered.length === 0) return null;
                                            
                                            return (
                                                <div key={domain} className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
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
                                                                    className={`relative group p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-3 h-full ${
                                                                        isSelected 
                                                                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                                                                        : 'bg-black/20 border-neutral-800/80 hover:border-neutral-700 hover:bg-black/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                                            isSelected 
                                                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                                                            : 'bg-neutral-800/50 text-neutral-500 group-hover:text-neutral-300'
                                                                        }`}>
                                                                            <IconComponent className="w-5 h-5" />
                                                                        </div>
                                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                                                            isSelected 
                                                                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                                                                            : 'border-neutral-700 bg-black/20 text-transparent'
                                                                        }`}>
                                                                            <Check className="w-3 h-3" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <h5 className={`text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                                                                            {service.name}
                                                                        </h5>
                                                                        <p className={`text-[11px] leading-relaxed transition-colors line-clamp-2 ${isSelected ? 'text-neutral-400' : 'text-neutral-600 group-hover:text-neutral-500'}`}>
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
                                     </div>
                                         
                                     <div className="mt-8 pt-8 border-t border-neutral-800/50">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <Plus className="w-3 h-3" /> Add Custom Service
                                        </label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={customService} 
                                                onChange={(e) => setCustomService(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
                                                className="flex-1 rounded-xl bg-black/40 border border-neutral-800 px-4 py-2 text-sm text-white focus:border-indigo-500 transition-all outline-none" 
                                                placeholder="Type service name and press Enter..." 
                                            />
                                            <button 
                                                type="button"
                                                onClick={addCustomService}
                                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-bold transition-all"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar Right Side */}
                            <div className="lg:col-span-1 bg-black/40 border-l border-neutral-800 p-8 space-y-8">
                                {/* Section 3: Logistics */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 flex items-center justify-center text-xs font-bold">03</div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Logistics</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Expected Timeline
                                            </label>
                                             <div className="flex items-center justify-between gap-2">
                                                <select 
                                                    value={isCustomTimeline ? 'CUSTOM' : formData.timeline} 
                                                    onChange={(e) => {
                                                        if (e.target.value === 'CUSTOM') {
                                                            setIsCustomTimeline(true);
                                                        } else {
                                                            setIsCustomTimeline(false);
                                                            setFormData({ ...formData, timeline: e.target.value });
                                                        }
                                                    }} 
                                                    className="flex-1 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm text-white transition-all outline-none appearance-none cursor-pointer hover:border-neutral-700 font-medium"
                                                >
                                                    <option value="">Select timeframe</option>
                                                    <option value="Immediately">Immediately</option>
                                                    <option value="1-2 Weeks">1-2 Weeks</option>
                                                    <option value="1 Month">1 Month</option>
                                                    <option value="3+ Months">3+ Months</option>
                                                    <option value="TBD">TBD</option>
                                                    <option value="CUSTOM">Custom Range...</option>
                                                </select>
                                            </div>
                                            {isCustomTimeline && (
                                                <div className="flex gap-2 mt-2 animate-in slide-in-from-top-2 duration-200">
                                                    <input 
                                                        type="number" 
                                                        value={customTimeline.value} 
                                                        onChange={(e) => setCustomTimeline({ ...customTimeline, value: e.target.value })}
                                                        placeholder="Qty"
                                                        className="w-20 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white focus:border-indigo-500 transition-all outline-none"
                                                    />
                                                    <select 
                                                        value={customTimeline.unit} 
                                                        onChange={(e) => setCustomTimeline({ ...customTimeline, unit: e.target.value })}
                                                        className="flex-1 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white outline-none cursor-pointer"
                                                    >
                                                        <option value="Days">Days</option>
                                                        <option value="Weeks">Weeks</option>
                                                        <option value="Months">Months</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <DollarSign className="w-3 h-3" /> Indicated Budget (INT)
                                            </label>
                                             <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm group-focus-within:text-indigo-400">$</span>
                                                <input 
                                                    type="number" 
                                                    value={formData.budgetRange} 
                                                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })} 
                                                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-8 pr-4 py-2.5 text-sm text-white transition-all outline-none hover:border-neutral-700 focus:border-indigo-500 font-mono" 
                                                    placeholder="Enter amount (e.g. 10000)" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                <Target className="w-3 h-3" /> Lead Source
                                            </label>
                                            <select value={formData.discoverySource} onChange={(e) => setFormData({ ...formData, discoverySource: e.target.value })} className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-sm text-white transition-all outline-none appearance-none cursor-pointer hover:border-neutral-700">
                                                <option value="">Select source</option>
                                                <option value="Inbound - Website">Inbound - Website</option>
                                                <option value="Outbound - Cold Email">Outbound - Cold Email</option>
                                                <option value="LinkedIn">LinkedIn</option>
                                                <option value="Referral">Referral</option>
                                                <option value="Clutch">Clutch</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Brief */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 flex items-center justify-center text-xs font-bold">04</div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Briefing</h3>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <Lightbulb className="w-3 h-3" /> Initial Notes
                                        </label>
                                        <textarea 
                                            rows={6} 
                                            value={formData.projectDescription} 
                                            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })} 
                                            className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-indigo-500 transition-all outline-none resize-none" 
                                            placeholder="Context, known requirements, or discovery notes..." 
                                        />
                                    </div>
                                </section>

                                {/* Selected items summary */}
                                <div className="mt-8 pt-8 border-t border-neutral-800">
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Selected Scope ({formData.servicesRequested.length})</p>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                        {formData.servicesRequested.map((id: string) => {
                                            const service = Object.values(PROJECT_SERVICES).flat().find((s: { id: string; name: string; description: string; icon: string }) => s.id === id);
                                            if (!service) return <span key={id} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{id}</span>;
                                            return (
                                                <div key={id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-neutral-800/30 border border-neutral-800 group/item">
                                                    <span className="text-[10px] text-neutral-300 font-medium truncate">{service?.name || id}</span>
                                                    <button type="button" onClick={() => toggleService(id)} className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover/item:opacity-100">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {formData.servicesRequested.length === 0 && (
                                            <p className="text-[10px] text-neutral-700 italic">No services selected yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                 <div className="px-8 py-6 border-t border-neutral-800 bg-black/60 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 font-bold text-sm transition-all">
                            Discard Changes
                        </button>
                        {isEdit && (
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Enquiry
                            </button>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        form="enquiry-form"
                        disabled={loading} 
                        className="flex items-center gap-2 px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95"
                    >
                        {loading ? ( <><Loader2 className="w-4 h-4 animate-spin" /> Logging to CRM...</> ) : ( <><Send className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Log Enquiry to Pipeline'}</> )}
                    </button>
                </div>

            </div>
        </div>
    );
}
