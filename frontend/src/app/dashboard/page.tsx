"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    Briefcase,
    CheckCircle2,
    Clock,
    Activity,
    CreditCard,
    DollarSign,
    Target,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import ClientDashboard from '@/components/ClientDashboard';
import FreelancerDashboard from '@/components/FreelancerDashboard';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        activeProjects: 0,
        totalPartners: 0,
        revenueMTD: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalEnquiries: 0,
        weightedPipeline: 0
    });
    
    // Funnel Stats
    const [funnel, setFunnel] = useState({
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal: 0,
        won: 0
    });

    const [activeProjectsList, setActiveProjectsList] = useState<any[]>([]);
    const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [projectsRes, partnersRes, taskStatsRes, enquiriesRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/partners'),
                    api.get('/projects/tasks/stats'),
                    api.get('/enquiries')
                ]);

                const projects = projectsRes.data;
                const partners = partnersRes.data;
                const taskStats = taskStatsRes.data;
                const enquiries = enquiriesRes.data;

                // Simple metric calculation
                const active = projects.filter((p: any) => p.status === 'ACTIVE');
                const revenue = projects.reduce((acc: number, p: any) => acc + (p.totalValue || 0), 0);

                // CRM calculation
                const weighted = enquiries.reduce((acc: number, e: any) => acc + ((e.estimatedValue || 0) * ((e.probability || 0) / 100)), 0);

                setStats({
                    activeProjects: active.length,
                    totalPartners: partners.length,
                    revenueMTD: revenue,
                    completedTasks: taskStats.completed || 0,
                    pendingTasks: taskStats.pending || 0,
                    totalEnquiries: enquiries.length,
                    weightedPipeline: weighted
                });
                
                // Funnel calculation
                setFunnel({
                    new: enquiries.filter((e: any) => e.stage === 'NEW').length,
                    contacted: enquiries.filter((e: any) => e.stage === 'CONTACTED').length,
                    qualified: enquiries.filter((e: any) => e.stage === 'QUALIFIED').length,
                    proposal: enquiries.filter((e: any) => e.stage === 'PROPOSAL_SENT').length,
                    won: enquiries.filter((e: any) => e.stage === 'WON').length,
                });

                setActiveProjectsList(active.slice(0, 4));
                setRecentEnquiries(enquiries.slice(0, 4));
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const businessReserve = stats.revenueMTD * 0.1;
    const religiousSurcharge = stats.revenueMTD * 0.05;
    const netDistributable = stats.revenueMTD - businessReserve - religiousSurcharge;

    const statCards = [
        { name: 'MTD Revenue', value: `₹${stats.revenueMTD.toLocaleString('en-IN')}`, icon: DollarSign, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
        { name: 'Net Distributable', value: `₹${netDistributable.toLocaleString('en-IN')}`, icon: Target, iconColor: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
        { name: 'Leads Pipeline', value: `₹${stats.weightedPipeline.toLocaleString('en-IN')}`, icon: TrendingUp, iconColor: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
        { name: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, iconColor: 'text-indigo-400', bg: 'bg-indigo-500/10', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (user?.role === 'CLIENT') {
        return <ClientDashboard />;
    }

    if (user?.role === 'PARTNER') {
        return <FreelancerDashboard />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-20">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm mb-1">Agency Command Center</h1>
                    <p className="text-neutral-400 text-sm font-light flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400 animate-pulse" /> Live Systems Status: Operational
                    </p>
                </div>
            </div>

            {/* Financials Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className={`bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 ${stat.glow} transition-all hover:bg-white/[0.03] group`}>
                        <div className={`p-3 rounded-xl ${stat.bg} border border-white/5 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400 mb-1 drop-shadow-sm">{stat.name}</p>
                            <p className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Pipeline Funnel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-indigo-400" />
                                <h2 className="font-semibold text-neutral-200">Active Sales Pipeline</h2>
                            </div>
                            <Link href="/dashboard/enquiries" className="text-xs text-blue-400 hover:text-blue-300 font-medium tracking-tight bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 transition-colors">Go to CRM</Link>
                        </div>
                        <div className="p-8">
                            <div className="flex items-end justify-between gap-2 h-40">
                                {[
                                    { label: 'New', count: funnel.new, color: 'from-sky-500/80 to-sky-600/80' },
                                    { label: 'Contacted', count: funnel.contacted, color: 'from-blue-500/80 to-blue-600/80' },
                                    { label: 'Qualified', count: funnel.qualified, color: 'from-indigo-500/80 to-indigo-600/80' },
                                    { label: 'Proposal', count: funnel.proposal, color: 'from-violet-500/80 to-violet-600/80' },
                                    { label: 'Won', count: funnel.won, color: 'from-emerald-500/80 to-emerald-600/80' }
                                ].map((stage, idx, arr) => {
                                    const maxCount = Math.max(...arr.map(s => s.count), 1);
                                    const heightPercentage = Math.max((stage.count / maxCount) * 100, 10);
                                    
                                    return (
                                        <div key={stage.label} className="flex-1 flex flex-col items-center gap-3 relative group">
                                            <div className="text-sm font-bold text-white drop-shadow-md">{stage.count}</div>
                                            <div className="w-full flex justify-center items-end h-full">
                                                <div 
                                                    className={`w-full max-w-[80px] bg-gradient-to-t ${stage.color} rounded-t-xl border-x border-t border-white/10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] group-hover:brightness-125 transition-all`}
                                                    style={{ height: `${heightPercentage}%`, minHeight: '24px' }}
                                                />
                                            </div>
                                            <div className="text-xs text-neutral-400 font-medium tracking-tight">{stage.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Resource Allocation Grid */}
                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-blue-400" />
                                <h2 className="font-semibold text-neutral-200">Active Resource Allocation</h2>
                            </div>
                            <Link href="/dashboard/projects" className="text-xs text-blue-400 hover:text-blue-300 font-medium tracking-tight">View Schedule</Link>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="py-8 text-center text-neutral-500 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    Loading resources...
                                </div>
                            ) : activeProjectsList.length > 0 ? (
                                <div className="space-y-4">
                                    {activeProjectsList.map((project) => (
                                        <div key={project.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center shadow-inner">
                                                    <Briefcase className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{project.name}</p>
                                                    <p className="text-xs text-neutral-400">{project.clientName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    {/* Mocking team avatars for the UI - normally this would map over project.partners */}
                                                    <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-[#0a0f16] flex items-center justify-center text-[10px] font-bold text-blue-200">JD</div>
                                                    <div className="w-8 h-8 rounded-full bg-indigo-900 border-2 border-[#0a0f16] flex items-center justify-center text-[10px] font-bold text-indigo-200">AK</div>
                                                    {project.partners?.length > 2 && (
                                                        <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-[#0a0f16] flex items-center justify-center text-[10px] font-bold text-neutral-400">+{project.partners.length - 2}</div>
                                                    )}
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
                                                    ON TRACK
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-neutral-500">No active projects require resources.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Financials & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-[#0a0f16]/80 to-[#0a0f16]/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        <h2 className="font-semibold text-neutral-200 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-400" />
                            Profit Distribution Map
                        </h2>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-neutral-400 tracking-tight">Business Reserve (10%)</span>
                                <span className="text-emerald-400 font-medium">₹{businessReserve.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-neutral-400 tracking-tight">Religious Surcharge (5%)</span>
                                <span className="text-indigo-400 font-medium">₹{religiousSurcharge.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-px bg-white/10 my-4" />
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
                                <span className="text-blue-200 font-semibold tracking-tight">Net Distributable</span>
                                <span className="text-white font-bold text-xl drop-shadow-md">₹{netDistributable.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,106,244,0.4)] transition-all">
                            <CheckCircle2 className="w-4 h-4" /> Finalize Allocations
                        </button>
                    </div>

                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-neutral-200 drop-shadow-sm">Agreement Status</p>
                                <p className="text-xs text-neutral-500 tracking-tight">All current partners verified</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
