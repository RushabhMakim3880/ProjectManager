"use client";

import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    Layout, 
    MessageSquare, 
    Shield, 
    TrendingUp,
    FileText
} from 'lucide-react';
import api from '@/lib/api';

export default function ClientDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data);
            } catch (err) {
                console.error("Error fetching client projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClientData();
    }, []);

    const activeProjects = projects.filter(p => p.status === 'ACTIVE');
    const totalValue = projects.reduce((acc, p) => acc + (p.totalValue || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm mb-1">Welcome, Customer Portal</h1>
                    <p className="text-neutral-400 text-sm font-light flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" /> Secure Project Oversight Active
                    </p>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-white/5">
                        <Briefcase className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Active Engagements</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{activeProjects.length}</p>
                    </div>
                </div>
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-white/5">
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Project Portfolio Value</p>
                        <p className="text-2xl font-bold text-white tracking-tight">₹{totalValue.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-white/5">
                        <CheckCircle2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Completed Milestones</p>
                        <p className="text-2xl font-bold text-white tracking-tight">
                            {projects.reduce((acc, p) => acc + (p.milestones?.filter((m: any) => m.status === 'COMPLETED').length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Projects Progress List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h2 className="font-semibold text-neutral-200 flex items-center gap-2">
                                <Layout className="w-5 h-5 text-indigo-400" />
                                Project Trackers
                            </h2>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="py-20 text-center text-neutral-500">Retrieving project secure data...</div>
                            ) : projects.length > 0 ? (
                                <div className="space-y-6">
                                    {projects.map((project) => (
                                        <div key={project.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
                                                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{project.category || 'Standard Engagement'}</p>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase">
                                                    {project.status}
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="space-y-2 mb-6">
                                                <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                                    <span>Overall Completion</span>
                                                    <span>75%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-[75%] shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                                    <Clock className="w-4 h-4 text-orange-400" />
                                                    <div>
                                                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Next Deadline</p>
                                                        <p className="text-sm text-neutral-200">{project.clientDeadline ? new Date(project.clientDeadline).toLocaleDateString() : 'TBD'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                                    <FileText className="w-4 h-4 text-emerald-400" />
                                                    <div>
                                                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Approved Deliverables</p>
                                                        <p className="text-sm text-neutral-200">12 / 15</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-neutral-500">No projects associated with your profile.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Communication & Alerts */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-[#0a0f16]/80 to-[#0a0f16]/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <h2 className="font-semibold text-neutral-200 mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            Security & Compliance
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                                <p className="text-xs text-neutral-300">NDA for all active projects verified and signed on 2024-03-11.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                                <p className="text-xs text-neutral-300">Bi-weekly vulnerability assessment completed for Project Alpha.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl text-center">
                        <MessageSquare className="w-10 h-10 text-indigo-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-sm font-semibold text-white mb-2">Need Support?</h3>
                        <p className="text-xs text-neutral-500 mb-6 font-light underline underline-offset-4 decoration-neutral-800">Direct escalation available for all active engagements.</p>
                        <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors">
                            Contact Account Lead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
