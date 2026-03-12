"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    Briefcase, 
    AlertTriangle, 
    CheckCircle, 
    Search, 
    Filter, 
    TrendingUp, 
    Loader2, 
    Mail, 
    User,
    ChevronRight,
    ExternalLink
} from 'lucide-react';

interface PartnerWorkload {
    id: string;
    name: string;
    email: string;
    skills: string[];
    activeProjectsCount: number;
    projects: { id: string; name: string }[];
}

export default function ResourceDashboard() {
    const [workloads, setWorkloads] = useState<PartnerWorkload[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSkill, setFilterSkill] = useState('');

    const fetchWorkloads = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/partners/workload`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkloads(res.data);
        } catch (error) {
            console.error("Failed to fetch workloads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkloads();
    }, []);

    const allSkills = Array.from(new Set(workloads.flatMap(w => w.skills))).sort();

    const filteredWorkloads = workloads.filter(w => {
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             w.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSkill = filterSkill === '' || w.skills.includes(filterSkill);
        return matchesSearch && matchesSkill;
    });

    const stats = {
        totalPartners: workloads.length,
        available: workloads.filter(w => w.activeProjectsCount === 0).length,
        overloaded: workloads.filter(w => w.activeProjectsCount >= 3).length,
        avgProjects: workloads.length > 0 
            ? (workloads.reduce((sum, w) => sum + w.activeProjectsCount, 0) / workloads.length).toFixed(1)
            : 0
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Resource Capacity</h1>
                    <p className="text-neutral-500 text-sm mt-1">Real-time partner workload tracking and availability analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchWorkloads}
                        className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-colors"
                        title="Refresh Data"
                    >
                        <TrendingUp className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Partners" 
                    value={stats.totalPartners} 
                    icon={Users} 
                    color="text-blue-400" 
                    bg="bg-blue-400/10"
                />
                <StatCard 
                    title="Avg Allocation" 
                    value={`${stats.avgProjects} Projs`} 
                    icon={Briefcase} 
                    color="text-indigo-400" 
                    bg="bg-indigo-400/10"
                />
                <StatCard 
                    title="Available Now" 
                    value={stats.available} 
                    icon={CheckCircle} 
                    color="text-emerald-400" 
                    bg="bg-emerald-400/10"
                    trend="Ready to assign"
                />
                <StatCard 
                    title="Overloaded" 
                    value={stats.overloaded} 
                    icon={AlertTriangle} 
                    color="text-red-400" 
                    bg="bg-red-400/10"
                    trend={stats.overloaded > 0 ? "High Risk" : "None"}
                />
            </div>

            {/* Filters & Search */}
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="text"
                        placeholder="Search partners..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500/50 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-neutral-500" />
                        <select 
                            value={filterSkill}
                            onChange={(e) => setFilterSkill(e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-medium appearance-none cursor-pointer pr-10 relative"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                        >
                            <option value="">All Skills</option>
                            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Capacity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredWorkloads.map((partner) => (
                    <PartnerCapacityCard key={partner.id} partner={partner} />
                ))}

                {filteredWorkloads.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                        <Users className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-500 font-medium">No partners found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg, trend }: any) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-sm hover:border-neutral-700 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 ${bg} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend && <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${bg} ${color} border border-white/5`}>{trend}</span>}
            </div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
    );
}

function PartnerCapacityCard({ partner }: { partner: PartnerWorkload }) {
    const isOverloaded = partner.activeProjectsCount >= 3;
    const isHealthy = partner.activeProjectsCount > 0 && partner.activeProjectsCount < 3;
    const isAvailable = partner.activeProjectsCount === 0;

    let statusColor = "text-blue-400";
    let statusBg = "bg-blue-400/10";
    let statusText = "Stable";

    if (isOverloaded) {
        statusColor = "text-red-400";
        statusBg = "bg-red-400/10";
        statusText = "Overloaded";
    } else if (isAvailable) {
        statusColor = "text-emerald-400";
        statusBg = "bg-emerald-400/10";
        statusText = "Available";
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-600 transition-all flex flex-col group h-full">
            {/* Status Bar */}
            <div className={`h-1.5 w-full ${statusBg.replace('/10', '')} opacity-40`} />
            
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-800 to-black border border-neutral-700 flex items-center justify-center font-bold text-neutral-400 text-lg group-hover:text-white transition-colors">
                            {partner.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{partner.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {partner.email}
                            </div>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusBg} ${statusColor} border border-white/5`}>
                        {statusText}
                    </div>
                </div>

                {/* Workload Indicator */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Active Projects</span>
                        <span className={`text-xs font-bold ${statusColor}`}>{partner.activeProjectsCount} / 3 Safety limit</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                        {[1, 2, 3].map(i => (
                            <div 
                                key={i}
                                className={`h-full flex-1 border-r border-neutral-900 last:border-0 transition-all duration-700 ${
                                    i <= partner.activeProjectsCount 
                                        ? (isOverloaded ? 'bg-red-500' : isHealthy ? 'bg-blue-500' : 'bg-emerald-500')
                                        : 'bg-transparent'
                                }`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Assigned Projects */}
                <div className="space-y-2 mb-6 flex-1">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Assigned Leads</p>
                    {partner.projects.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-neutral-800/50 group/item hover:bg-neutral-800/40 transition-colors">
                            <span className="text-sm text-neutral-300 font-medium truncate pr-4">{p.name}</span>
                            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover/item:text-indigo-400 transition-colors" />
                        </div>
                    ))}
                    {partner.projects.length === 0 && (
                        <div className="py-4 text-center border border-dashed border-neutral-800 rounded-xl">
                            <p className="text-[10px] italic text-neutral-600">No active lead roles</p>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-neutral-800">
                    {partner.skills.map((skill, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-neutral-800 text-neutral-500 rounded-lg border border-neutral-700 uppercase font-mono tracking-tighter">
                            {skill}
                        </span>
                    ))}
                    {partner.skills.length === 0 && <span className="text-[9px] italic text-neutral-700">No skills listed</span>}
                </div>
            </div>
        </div>
    );
}
