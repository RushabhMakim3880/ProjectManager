"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Target, Users, AlertTriangle, ArrowRight, DollarSign, PieChart, Info } from "lucide-react";
import { motion } from "framer-motion";
import api from '@/lib/api';

interface PredictionData {
    predictedIncome: number;
    predictedGPR: number;
    predictions: {
        businessReserve: number;
        religiousAllocation: number;
        NDP: number;
        basePool: number;
        performancePool: number;
        partnerShares: Array<{
            id: string;
            name: string;
            contributionPercent: number;
            baseShare: number;
            performanceShare: number;
            finalPayout: number;
        }>;
    };
}

interface PredictionsViewProps {
    projectId: string;
    project: any;
}

export default function PredictionsView({ projectId, project }: PredictionsViewProps) {
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                const response = await api.get(`/payouts/predictions/${projectId}`);
                setData(response.data);
            } catch (err: any) {
                console.error("Failed to fetch predictions:", err);
                setError(err.response?.data?.error || "Failed to load predictive data");
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Running Financial Projections...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="glass-card p-12 text-center border-rose-500/20 bg-rose-500/5">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white uppercase italic">Projection Engine Error</h3>
                <p className="text-sm text-neutral-500 mt-2">{error || "No data available"}</p>
            </div>
        );
    }

    const { predictedIncome = 0, predictedGPR = 0, predictions = {} as any } = data || {};
    const partnerShares = predictions.partnerShares || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Prediction Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-indigo-500" />
                        Financial Projections
                    </h2>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Based on Budgeted Target: ₹{project.totalValue?.toLocaleString()}</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <Info className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">AI-Driven Forecast Model</span>
                </div>
            </div>

            {/* High Level Predicted Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Predicted Total Income', value: predictedIncome, icon: Target, color: 'indigo', desc: 'Max of Budget vs Actual' },
                    { label: 'Predicted GPR', value: predictedGPR, icon: DollarSign, color: 'emerald', desc: 'Income - Current OpEx' },
                    { label: 'Net Profit Reservoir', value: predictions?.NDP || 0, icon: PieChart, color: 'amber', desc: '80% Post-Reserves & Spiritual' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-neutral-800 bg-neutral-900/40 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700`}>
                            <stat.icon className="w-20 h-20" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">{stat.label}</h3>
                            <div className="text-3xl font-black text-white tracking-tighter">₹{stat.value.toLocaleString()}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <ArrowRight className="w-3 h-3 text-neutral-600" />
                                <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{stat.desc}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Predicted Partner Shares */}
            <div className="glass-card bg-neutral-900/20 border-neutral-800">
                <div className="p-6 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Estimated Partner Payouts
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-950/40">
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Partner</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center">Predicted Contribution</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Predicted Base</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Predicted Performance</th>
                                <th className="p-5 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Estimated Gross Share</th>
                                <th className="p-5 text-[10px] font-black text-rose-500 uppercase tracking-widest text-right">Current Advances</th>
                                <th className="p-5 text-[10px] font-black text-white uppercase tracking-widest text-right">Projected Net Payout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {partnerShares.map((p: any) => {
                                const currentAdvances = (project.advances || [])
                                    .filter((a: any) => a.partnerId === p.id)
                                    .reduce((sum: number, a: any) => sum + a.amount, 0);
                                
                                const projectedNet = p.finalPayout - currentAdvances;
                                const hasDeficit = projectedNet < 0;

                                return (
                                    <tr key={p.id} className="hover:bg-neutral-800/20 transition-all">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-sm font-black text-indigo-400">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-white">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-xs font-black text-indigo-400">{p.contributionPercent}%</span>
                                                <div className="w-20 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${p.contributionPercent}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-bold text-neutral-400 text-xs">
                                            ₹{p.baseShare.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-right font-bold text-amber-400 text-xs">
                                            ₹{p.performanceShare.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-right font-black text-emerald-400 text-sm">
                                            ₹{p.finalPayout.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-right font-black text-rose-400 text-sm">
                                            ₹{currentAdvances.toLocaleString()}
                                        </td>
                                        <td className={`p-5 text-right bg-neutral-950/20`}>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-base font-black tracking-tighter ${hasDeficit ? 'text-rose-500' : 'text-white'}`}>
                                                    ₹{projectedNet.toLocaleString()}
                                                </span>
                                                {hasDeficit && (
                                                    <span className="text-[8px] font-black uppercase text-rose-500/80 tracking-widest mt-1 border border-rose-500/20 px-1.5 py-0.5 rounded bg-rose-500/5">
                                                        Deficit Warning
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Disclaimer</p>
                    <p className="text-[10px] text-neutral-500 leading-relaxed uppercase font-bold">
                        Calculations are based on currently logged operational expenses and the target project budget. 
                        Final payouts may vary significantly based on additional overheads, tax adjustments, or changes in partner contribution matrices.
                    </p>
                </div>
            </div>
        </div>
    );
}
