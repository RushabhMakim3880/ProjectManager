"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    Briefcase,
    CheckCircle2,
    Clock,
    ExternalLink,
    Plus,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        activeProjects: 0,
        totalPartners: 0,
        revenueMTD: 0,
        completedTasks: 0,
        pendingTasks: 0
    });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [projectsRes, partnersRes, taskStatsRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/partners'),
                    api.get('/projects/tasks/stats')
                ]);

                const projects = projectsRes.data;
                const partners = partnersRes.data;
                const taskStats = taskStatsRes.data;

                // Simple metric calculation
                const active = projects.filter((p: any) => p.status === 'ACTIVE').length;
                const revenue = projects.reduce((acc: number, p: any) => acc + (p.totalValue || 0), 0);

                setStats({
                    activeProjects: active,
                    totalPartners: partners.length,
                    revenueMTD: revenue,
                    completedTasks: taskStats.completed || 0,
                    pendingTasks: taskStats.pending || 0
                });

                setRecentProjects(projects.slice(0, 3));
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { name: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { name: 'Total Partners', value: stats.totalPartners.toString(), icon: Users, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { name: 'Revenue (MTD)', value: `₹${stats.revenueMTD.toLocaleString('en-IN')}`, icon: TrendingUp, iconColor: 'text-amber-400', bg: 'bg-amber-500/10' },
        { name: 'Completed Tasks', value: stats.completedTasks.toString(), icon: CheckCircle2, iconColor: 'text-sky-400', bg: 'bg-sky-500/10' },
        { name: 'Pending Tasks', value: stats.pendingTasks.toString(), icon: Loader2, iconColor: 'text-orange-400', bg: 'bg-orange-500/10' },
    ];

    const businessReserve = stats.revenueMTD * 0.1;
    const religiousSurcharge = stats.revenueMTD * 0.05;
    const netDistributable = stats.revenueMTD - businessReserve - religiousSurcharge;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Portfolio Overview</h1>
                    <p className="text-neutral-500 text-sm">Welcome back, Administrator</p>
                </div>
                <Link href="/dashboard/projects" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="glass-card p-6 flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor || 'text-white'}`} />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">{stat.name}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-semibold">Recent Projects</h2>
                            <Link href="/dashboard/projects" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium tracking-tight">View All</Link>
                        </div>
                        <div className="divide-y divide-neutral-800">
                            {loading ? (
                                <div className="p-12 text-center text-neutral-500">Loading projects...</div>
                            ) : recentProjects.length > 0 ? (
                                recentProjects.map((project) => (
                                    <div key={project.id} className="p-6 flex items-center justify-between hover:bg-neutral-800/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors">
                                                <Briefcase className="w-5 h-5 text-neutral-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-100">{project.name}</p>
                                                <p className="text-xs text-neutral-500">{project.clientName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-medium text-neutral-200">₹{(project.totalValue || 0).toLocaleString('en-IN')}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-indigo-500 rounded-full`} style={{ width: `0%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-neutral-500">0%</span>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-neutral-800 text-neutral-400 group-hover:border-neutral-700 border border-transparent`}>
                                                {project.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-neutral-500">No projects found. Start by creating a new one.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="font-semibold mb-6">Profit Distribution</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">Business Reserve (10%)</span>
                                <span className="text-white font-medium">₹{businessReserve.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">Religious Surcharge (5%)</span>
                                <span className="text-white font-medium">₹{religiousSurcharge.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-px bg-neutral-800 my-2" />
                            <div className="flex items-center justify-between">
                                <span className="text-indigo-400 font-semibold tracking-tight">Net Distributable</span>
                                <span className="text-white font-bold">₹{netDistributable.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <button className="btn-outline w-full mt-8 text-sm flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Finalize Allocations
                        </button>
                    </div>

                    <div className="glass-card p-6 flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-500/10">
                                <Clock className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Agreement Status</p>
                                <p className="text-xs text-neutral-500">All current partners verified</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-neutral-700 group-hover:text-neutral-300 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
