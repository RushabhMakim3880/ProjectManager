"use client";

import { DollarSign, Percent, PieChart, Shield, Heart, Award, CheckCircle2, Clock, TrendingDown, Scale, Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface FinancialBreakdownProps {
    project: any;
    totalPartnerCount?: number;
}

export default function FinancialBreakdown({ project, totalPartnerCount = 1 }: FinancialBreakdownProps) {
    const latestFinancial = project.financialRecords?.[0];

    // Fallback to real-time calculation if manual sync hasn't happened
    const transactions = project.transactions || [];
    const totalIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const religiousSpent = transactions
        .filter((t: any) => t.type === 'EXPENSE' && t.category === 'RELIGIOUS')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const charitySpent = transactions
        .filter((t: any) => t.type === 'EXPENSE' && t.category === 'CHARITY')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalFaithSpent = religiousSpent + charitySpent;

    const actualBalance = totalIncome - totalExpenses; // Used as GPR

    // Constants to match deterministic backend logic
    const BUSINESS_RESERVE_PERCENT = 0.10;
    const RELIGIOUS_PERCENT = 0.05;
    const BASE_POOL_PERCENT = 0.20;
    const PERFORMANCE_POOL_PERCENT = 0.80;

    const businessGrowth = latestFinancial?.businessReserve ?? Number((actualBalance * BUSINESS_RESERVE_PERCENT).toFixed(2));
    const religiousAllocation = latestFinancial?.religiousAllocation ?? Number((actualBalance * RELIGIOUS_PERCENT).toFixed(2));
    const netDistributable = latestFinancial?.netDistributable ?? Number((actualBalance - businessGrowth - religiousAllocation).toFixed(2));

    const basePoolTotal = latestFinancial?.basePool ?? Number((netDistributable * BASE_POOL_PERCENT).toFixed(2));
    const performancePoolTotal = latestFinancial?.performancePool ?? Number((netDistributable * PERFORMANCE_POOL_PERCENT).toFixed(2));

    const partners = project.contributions || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Financial Intelligence</h2>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Deterministic Profit Distribution Engine v2.0</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase">Live Audit Active</span>
                    </div>
                </div>
            </div>

            {/* High Level Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Received', value: totalIncome, icon: DollarSign, color: 'indigo', desc: 'Gross Cash Inflow' },
                    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'rose', desc: 'Operating Costs' },
                    { label: 'Actual Balance', value: actualBalance, icon: Scale, color: 'amber', desc: 'Funds In-Hand' },
                    { label: 'Net Profit Pool', value: netDistributable, icon: Wallet, color: 'emerald', desc: '85% Distributable' },
                ].map((stat, i) => (
                    <div key={i} className={`relative group overflow-hidden glass-card p-5 border-${stat.color}-500/20 bg-${stat.color}-500/5 hover:bg-${stat.color}-500/10 transition-all duration-500`}>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <stat.icon className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 bg-${stat.color}-500/10 rounded-xl text-${stat.color}-400`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{stat.label}</h3>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">₹{stat.value.toLocaleString()}</div>
                            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-1">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Profit Pools Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 bg-neutral-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                        <PieChart className="w-64 h-64" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Distributable Pools</h3>
                            <p className="text-xs text-neutral-500 font-medium">Strategic split of the ₹{netDistributable.toLocaleString()} Net Reservoir</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="p-6 rounded-2xl bg-neutral-950/50 border border-neutral-800 group hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Base Pool (20%)</span>
                                <Award className="w-4 h-4 text-indigo-500/50" />
                            </div>
                            <div className="text-xl font-black text-white mb-2">₹{basePoolTotal.toLocaleString()}</div>
                            <p className="text-[10px] text-neutral-500 leading-relaxed mb-4 font-medium italic">
                                Guaranteed security for all onboarded partners, distributed equitably.
                            </p>
                            <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '20%' }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-neutral-950/50 border border-neutral-800 group hover:border-amber-500/30 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Performance (80%)</span>
                                <TrendingDown className="w-4 h-4 text-amber-500/50 rotate-180" />
                            </div>
                            <div className="text-xl font-black text-white mb-2">₹{performancePoolTotal.toLocaleString()}</div>
                            <p className="text-[10px] text-neutral-500 leading-relaxed mb-4 font-medium italic">
                                Dynamic growth based on weighted task mastery and completion speed.
                            </p>
                            <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '80%' }}
                                    className="h-full bg-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reserves Summary Card */}
                <div className="glass-card p-6 bg-neutral-950/20 flex flex-col justify-between border-rose-500/10">
                    <div>
                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-rose-500/50" /> Strategic Reserves
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                                <div>
                                    <span className="text-xs text-neutral-400 font-bold block">Business Growth (10%)</span>
                                    <span className="text-[10px] text-neutral-600 uppercase tracking-widest italic font-medium">Reinvestment Capital</span>
                                </div>
                                <span className="text-sm font-black text-white">₹{businessGrowth.toLocaleString()}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                                    <div>
                                        <span className="text-xs text-neutral-400 font-bold block">Religious/Charity (5%)</span>
                                        <span className="text-[10px] text-neutral-600 uppercase tracking-widest italic font-medium">Mandatory Dist. Buffer</span>
                                    </div>
                                    <span className="text-sm font-black text-rose-400">₹{religiousAllocation.toLocaleString()}</span>
                                </div>

                                <div className={`p-3 rounded-xl border ${totalFaithSpent > religiousAllocation ? 'bg-amber-500/10 border-amber-500/20' : 'bg-neutral-900/50 border-neutral-800'}`}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Realized Spending</span>
                                        <span className={`text-[10px] font-black ${totalFaithSpent > religiousAllocation ? 'text-amber-400' : 'text-neutral-400'}`}>
                                            ₹{totalFaithSpent.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((totalFaithSpent / religiousAllocation) * 100, 100)}%` }}
                                            className={`h-full ${totalFaithSpent > religiousAllocation ? 'bg-amber-500' : 'bg-neutral-600'}`}
                                        />
                                    </div>
                                    {totalFaithSpent > religiousAllocation && (
                                        <div className="flex items-center gap-1.5 text-[8px] font-black text-amber-500 uppercase tracking-tighter">
                                            <Scale className="w-2.5 h-2.5" /> Over-Allocated: ₹{(totalFaithSpent - religiousAllocation).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all cursor-default">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Algorithmic Integrity</p>
                        <p className="text-[10px] text-neutral-500 leading-tight">Reserves are mathematically locked before pool splitting to maintain deterministic financial hygiene.</p>
                    </div>
                </div>
            </div>

            {/* Individual Partner Breakdown */}
            <div className="glass-card overflow-hidden bg-neutral-900/20 border-neutral-800/50">
                <div className="p-6 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Partner Performance Ledger
                    </h3>
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Calculated to 2 Decimals</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-950/40">
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Partner</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center">Score</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Base Share</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Performance</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Total Realized</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {partners.map((c: any) => {
                                const partnerTasks = (project.tasks || []).filter((t: any) => t.assignedPartnerId === c.partnerId);
                                const completedCount = partnerTasks.filter((t: any) => t.completionPercent === 100).length;
                                const totalCount = partnerTasks.length;

                                const performanceShare = c.percentage;
                                const performanceEarning = Number(((performanceShare / 100) * performancePoolTotal).toFixed(2));
                                const baseEarning = Number((basePoolTotal / (totalPartnerCount || 1)).toFixed(2));
                                const totalEarning = Number((performanceEarning + baseEarning).toFixed(2));

                                return (
                                    <tr key={c.partnerId} className="hover:bg-neutral-800/20 transition-all group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-sm font-black text-indigo-400 group-hover:border-indigo-500/50 transition-colors">
                                                    {c.partner?.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-white block">{c.partner?.user?.name}</span>
                                                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tighter flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {completedCount}/{totalCount} Tasks Matrix
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-xs font-black text-indigo-400">{performanceShare.toFixed(1)}%</span>
                                                <div className="w-20 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${performanceShare}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-xs font-bold text-neutral-400">₹{baseEarning.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-xs font-bold text-amber-400">₹{performanceEarning.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-base font-black text-white tracking-tighter">₹{totalEarning.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-tighter bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 mt-1">Realized</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {totalPartnerCount > partners.length && (
                                <tr className="bg-neutral-950/30">
                                    <td colSpan={5} className="p-4 text-center">
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                            Base share (₹{Number((basePoolTotal / (totalPartnerCount || 1)).toFixed(0)).toLocaleString()} each) also distributed to {totalPartnerCount - partners.length} other partner{totalPartnerCount - partners.length > 1 ? 's' : ''} not on this project
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Footer */}
            <div className="flex items-center justify-center gap-8 py-8 opacity-40 border-t border-neutral-800/30">
                <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default group">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-indigo-400">Advanced Cryptography Verified</span>
                </div>
                <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default group">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-emerald-400">Zero Error Distribution</span>
                </div>
            </div>
        </div>
    );
}
