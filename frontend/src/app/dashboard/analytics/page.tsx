'use client';

import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Users, 
    Briefcase, 
    BarChart3, 
    ArrowUpRight, 
    ArrowDownRight, 
    Target,
    Zap,
    DollarSign,
    Calendar,
    ChevronRight,
    Loader2,
    PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [partners, setPartners] = useState<any[]>([]);
    const [cashflow, setCashflow] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, partnersRes, cashflowRes] = await Promise.all([
                api.get('/analytics/agency'),
                api.get('/analytics/partners'),
                api.get('/analytics/cashflow')
            ]);
            setStats(statsRes.data);
            setPartners(partnersRes.data);
            setCashflow(cashflowRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#050505]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 bg-[#050505] min-h-screen text-white overflow-y-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Mission Intelligence</h1>
                </div>
                <p className="text-xs font-black text-neutral-500 uppercase tracking-widest leading-relaxed">
                    Real-time operational overview and performance vector analysis.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Agency Revenue', value: `₹${(stats?.revenue ?? 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Active Projects', value: stats?.activeProjects ?? 0, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Conversion Rate', value: `${(stats?.conversionRate ?? 0).toFixed(1)}%`, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Network Pulse', value: partners.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((item, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="glass-card p-6 bg-neutral-900/40 border-white/5 relative group hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${item.bg} blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">{item.label}</p>
                                <h3 className="text-2xl font-black tracking-tight">{item.value}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl ${item.bg} border border-white/5 shadow-xl`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Partner Efficiency Table */}
                <div className="lg:col-span-2 glass-card bg-neutral-900/20 border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <h2 className="text-sm font-black uppercase tracking-widest italic">Partner Matrix</h2>
                        </div>
                        <button className="text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
                            Full Leaderboard <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Operator</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Efficiency</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Total Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {partners.map((partner, idx) => (
                                    <tr key={partner.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/30">
                                                    {partner.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase italic">{partner.name}</p>
                                                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">{partner.activeProjects} Active Ops</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[120px] h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full" 
                                                    style={{ width: `${Math.min(partner.taskCount * 10, 100)}%` }} 
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-black text-white italic">₹{partner.totalEarnings.toLocaleString()}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Operations Health */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-neutral-900/40 border-white/5 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full border-4 border-neutral-800 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black italic">{stats?.completedProjects ?? 0}</span>
                                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Completed</span>
                            </div>
                            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-500 rounded-full rotate-45" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic mb-2">Delivery Velocity</h3>
                        <p className="text-[10px] leading-relaxed text-neutral-500 font-bold uppercase">Average turnaround for high-fidelity technical deliverables.</p>
                    </div>

                    <div className="glass-card p-6 bg-indigo-600 border-indigo-400 shadow-[0_20px_40px_rgba(79,70,229,0.3)] group cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800 opacity-90" />
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <BarChart3 className="w-8 h-8 text-white/50 mb-4" />
                            <h3 className="text-lg font-black italic text-white uppercase tracking-tighter">Strategic Growth</h3>
                            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mt-1">Review Q3 Vector Projections</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Cashflow Trend Placeholder */}
            <div className="glass-card p-8 bg-neutral-900/20 border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-indigo-400" /> Revenue Vector Analysis
                        </h2>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Last 6 months projection vs reality</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Expediture</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-64 w-full flex items-end gap-2 px-2">
                    {/* Simulated Chart Bars */}
                    {[40, 60, 45, 80, 55, 90, 70, 85, 65, 100, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-crosshair">
                            <div className="w-full relative flex items-end justify-center gap-1">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                                    className="w-full bg-gradient-to-t from-indigo-500/20 to-indigo-500/80 rounded-t-sm group-hover:to-indigo-400 transition-all border-t border-indigo-400/30" 
                                />
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h * 0.3}%` }}
                                    transition={{ delay: i * 0.05 + 0.5, duration: 1 }}
                                    className="w-full bg-rose-500/40 rounded-t-sm group-hover:bg-rose-500/60 transition-all" 
                                />
                            </div>
                            <span className="text-[8px] font-black text-neutral-600 uppercase">M{i+1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
