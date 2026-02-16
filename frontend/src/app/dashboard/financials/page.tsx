"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    PiggyBank,
    ArrowUpRight,
    Download,
    Calendar,
    PieChart
} from 'lucide-react';
import api from '@/lib/api';

export default function FinancialsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        mtdRevenue: 0,
        totalPayouts: 0,
        businessReserve: 0,
        projectedPayout: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinancials = async () => {
            setLoading(true);
            try {
                const [projectsRes, payoutsRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/payouts')
                ]);

                const projects = projectsRes.data;
                const payoutsData = payoutsRes.data;

                const mtdRevenue = projects.reduce((acc: number, p: any) => acc + (p.totalValue || 0), 0);
                const totalPayouts = payoutsData.reduce((acc: number, p: any) => acc + (p.totalPayout || 0), 0);
                const reserve = mtdRevenue * 0.1;

                setStats({
                    mtdRevenue,
                    totalPayouts,
                    businessReserve: reserve,
                    projectedPayout: (mtdRevenue * 0.85) * 0.8 // Rough estimation based on pools
                });

                setPayouts(payoutsData);
            } catch (err) {
                console.error("Financials fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFinancials();
    }, []);

    const statCards = [
        { label: 'MTD Revenue', value: stats.mtdRevenue, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Total Payouts', value: stats.totalPayouts, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Business Reserve', value: stats.businessReserve, icon: PiggyBank, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Projected Payout', value: stats.projectedPayout, icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Financial Intelligence</h1>
                    <p className="text-neutral-500 text-sm">Comprehensive overview of revenue, pools, and payouts</p>
                </div>
                <button className="btn-outline flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">₹{stat.value.toLocaleString('en-IN')}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-400" />
                        Pool Allocation Weights
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Business Reserve</span>
                                <span className="text-white font-medium">10%</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '10%' }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Religious Surcharge</span>
                                <span className="text-white font-medium">5%</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: '5%' }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Base Pool (Equal Split)</span>
                                <span className="text-white font-medium">20% of net</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Performance Pool (Contribution Based)</span>
                                <span className="text-white font-medium">80% of net</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500" style={{ width: '80%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">Recent Payout Cycles</h2>
                    </div>
                    <div className="flex-1 divide-y divide-neutral-800">
                        {loading ? (
                            <div className="p-12 text-center text-neutral-500">Loading payouts...</div>
                        ) : payouts.length > 0 ? (
                            payouts.map((payout) => (
                                <div key={payout.id} className="p-6 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                                    <div>
                                        <p className="font-semibold text-white">{payout.project?.name}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{payout.partner?.user?.name} • {new Date(payout.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">₹{payout.totalPayout.toLocaleString('en-IN')}</p>
                                        <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">{payout.isApproved ? 'Approved' : 'Pending'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-neutral-500">No payout history found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
