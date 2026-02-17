"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    Briefcase,
    CheckCircle2,
    Clock,
    ExternalLink,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        activeProjects: 0,
        totalPartners: 0,
        revenueMTD: 0,
        completedTasks: 0
    });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [projectsRes, partnersRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/partners')
                ]);

                const projects = projectsRes.data;
                const partners = partnersRes.data;

                // Simple metric calculation
                const active = projects.filter((p: any) => p.status === 'ACTIVE').length;
                const revenue = projects.reduce((acc: number, p: any) => acc + (p.totalValue || 0), 0);

                setStats({
                    activeProjects: active,
                    totalPartners: partners.length,
                    revenueMTD: revenue,
                    completedTasks: 0 // Placeholder until task counts are joined
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
    ];

    const businessReserve = stats.revenueMTD * 0.1;
    const religiousSurcharge = stats.revenueMTD * 0.05;
    const netDistributable = stats.revenueMTD - businessReserve - religiousSurcharge;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-100 mb-1">Portfolio Overview</h1>
                    <p className="text-neutral-500 text-sm">Welcome back, Administrator</p>
                </div>
                <Link href="/dashboard/projects" className="btn-primary">
                    <Plus className="w-4 h-4" /> New Project
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.name} className="card-standard p-5 flex items-start justify-between group hover:border-neutral-700 transition-colors">
                        <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{stat.name}</p>
                            <p className="text-2xl font-semibold text-neutral-100 tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 group-hover:text-neutral-200 transition-colors`}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card-standard overflow-hidden min-h-[400px]">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                            <h2 className="text-sm font-semibold text-neutral-200">Recent Projects</h2>
                            <Link href="/dashboard/projects" className="text-xs text-neutral-400 hover:text-neutral-200 font-medium transition-colors">View All</Link>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-neutral-500 text-sm">Loading projects...</div>
                        ) : recentProjects.length > 0 ? (
                            <div className="divide-y divide-neutral-800">
                                <div className="grid grid-cols-12 px-4 py-2 border-b border-neutral-800 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                                    <div className="col-span-6">Project Name</div>
                                    <div className="col-span-3 text-right">Value</div>
                                    <div className="col-span-3 text-right">Status</div>
                                </div>
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/projects/${project.id}`}
                                        className="grid grid-cols-12 px-4 py-3 items-center hover:bg-neutral-800/50 transition-colors group text-sm"
                                    >
                                        <div className="col-span-6">
                                            <p className="font-medium text-neutral-200 group-hover:text-white truncate">{project.name}</p>
                                            <p className="text-xs text-neutral-500 truncate">{project.clientName}</p>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <p className="text-neutral-300 font-mono">₹{(project.totalValue || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="col-span-3 flex justify-end">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${project.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    project.status === 'COMPLETED' ? 'bg-neutral-800 border-neutral-700 text-neutral-400' :
                                                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-neutral-500 text-sm">No projects found.</div>
                        )}
                    </div>
                </div>

                {/* Profit Distribution */}
                <div className="space-y-4">
                    <div className="card-standard p-5">
                        <h2 className="text-sm font-semibold text-neutral-200 mb-4">Financial Snapshot</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800/50">
                                <span className="text-neutral-500">Gross Revenue (MTD)</span>
                                <span className="text-neutral-200 font-mono">₹{stats.revenueMTD.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800/50">
                                <span className="text-neutral-500">Business Reserve (10%)</span>
                                <span className="text-neutral-300 font-mono">₹{businessReserve.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800/50">
                                <span className="text-neutral-500">Religious Surcharge (5%)</span>
                                <span className="text-neutral-300 font-mono">₹{religiousSurcharge.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-emerald-500">Net Distributable</span>
                                <span className="text-lg font-bold text-white font-mono">₹{netDistributable.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <button className="btn-outline w-full mt-6">
                            <CheckCircle2 className="w-4 h-4" /> Finalize Month
                        </button>
                    </div>

                    <div className="card-standard p-4 flex items-center justify-between hover:border-neutral-700 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-200">System Status</p>
                                <p className="text-xs text-neutral-500">All systems operational</p>
                            </div>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
