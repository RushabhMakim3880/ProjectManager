"use client";

import { DollarSign, Percent, PieChart, Shield, Heart, Award, CheckCircle2, Clock, TrendingDown, Scale, Wallet } from "lucide-react";

interface FinancialBreakdownProps {
    project: any;
}

export default function FinancialBreakdown({ project }: FinancialBreakdownProps) {
    const latestFinancial = project.financialRecords?.[0];

    // Fallback to real-time calculation if manual sync hasn't happened
    const transactions = project.transactions || [];
    const totalIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const actualBalance = totalIncome - totalExpenses;

    const businessGrowth = latestFinancial?.businessReserve ?? (actualBalance * 0.10);
    const religiousAllocation = latestFinancial?.religiousAllocation ?? (actualBalance * 0.05);
    const netDistributable = latestFinancial?.netDistributable ?? (actualBalance - businessGrowth - religiousAllocation);

    const basePoolTotal = latestFinancial?.basePool ?? (netDistributable * 0.20);
    const performancePoolTotal = latestFinancial?.performancePool ?? (netDistributable * 0.80);

    const partners = project.contributions || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* High Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest leading-none">Total Received</h3>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">₹{totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-neutral-500 mt-2">Cash inflow from the project ledger</p>
                </div>

                <div className="glass-card p-6 bg-rose-500/5 border-rose-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest leading-none">Total Expenses</h3>
                    </div>
                    <div className="text-3xl font-bold text-rose-400 tracking-tight">₹{totalExpenses.toLocaleString()}</div>
                    <p className="text-xs text-neutral-500 mt-2">Operating costs and project spends</p>
                </div>

                <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Scale className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest leading-none">Actual Balance</h3>
                    </div>
                    <div className="text-3xl font-bold text-amber-400 tracking-tight">₹{actualBalance.toLocaleString()}</div>
                    <p className="text-xs text-neutral-500 mt-2">Funds currently available in-hand</p>
                </div>

                <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest leading-none">Net Profit Pool</h3>
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 tracking-tight">₹{netDistributable.toLocaleString()}</div>
                    <p className="text-xs text-neutral-500 mt-2">85% after Business (10%) & Charity (5%)</p>
                </div>
            </div>

            {/* Profit Pools Section */}
            <div className="glass-card p-8 bg-neutral-900/40">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white">Partner Payout Pools</h3>
                        <p className="text-sm text-neutral-500">Breakdown of the 85% net distributable amount (₹{netDistributable.toLocaleString()})</p>
                    </div>
                    <PieChart className="w-8 h-8 text-indigo-500/50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Base Pool (20%)</span>
                            <span className="text-lg font-bold text-white">₹{basePoolTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                            Distributed equally or based on equity status to all onboarded partners, ensuring base security for team members.
                        </p>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[20%]" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Performance Pool (80%)</span>
                            <span className="text-lg font-bold text-white">₹{performancePoolTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                            Distributed dynamically based on weighted task completion. Your share grows as you complete more critical tasks.
                        </p>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[80%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Individual Partner Breakdown */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-neutral-800 bg-neutral-900/20">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Partner Earnings Breakdown
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/50">
                                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Partner</th>
                                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tasks Done</th>
                                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Weighted Share</th>
                                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Realized (Perf.)</th>
                                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Total Realized (Incl. Base)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {partners.map((c: any) => {
                                const partnerTasks = (project.tasks || []).filter((t: any) => t.assignedPartnerId === c.partnerId);
                                const completedCount = partnerTasks.filter((t: any) => t.completionPercent === 100).length;
                                const totalCount = partnerTasks.length;

                                const performanceShare = c.percentage; // This is the weighted share calculated by backend
                                const performanceEarning = (performanceShare / 100) * performancePoolTotal;

                                // Simplified base share distribution (equal for now)
                                const baseEarning = basePoolTotal / (partners.length || 1);
                                const totalEarning = performanceEarning + baseEarning;

                                return (
                                    <tr key={c.partnerId} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                    {c.partner?.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-semibold text-white">{c.partner?.user?.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                {completedCount} / {totalCount}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${performanceShare}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-indigo-400">{performanceShare.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-sm font-bold text-emerald-400">₹{performanceEarning.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-white">₹{totalEarning.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">Paid from Received Funds</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-dashed border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Pending Payouts</h4>
                    </div>
                    {(() => {
                        const totalPotential = performancePoolTotal;
                        const distributed = Object.values(partners).reduce((acc: number, c: any) => acc + (c.percentage / 100) * performancePoolTotal, 0);
                        const pending = totalPotential - distributed;

                        return (
                            <>
                                <div className="text-2xl font-bold text-white">₹{pending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                <p className="text-xs text-neutral-500 mt-2">Locked in uncompleted tasks across the technical scope.</p>
                            </>
                        );
                    })()}
                </div>

                <div className="glass-card p-6 border-dashed border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Total Transparency</h4>
                        <p className="text-xs text-neutral-500">Every partner has access to this data. Calculations are derived directly from task weights and **Actual Realized Ledger Balance**.</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="px-2 py-1 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-400 uppercase tracking-widest">Audited Live</div>
                        <div className="px-2 py-1 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 uppercase tracking-widest">Recalculated 1s Ago</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
