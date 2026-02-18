'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    DollarSign,
    PieChart,
    Download,
    Plus,
    Building2,
    Users,
    Clock // Added Clock icon
} from 'lucide-react';
import api from '@/lib/api';
import CapitalInjectionModal from '@/components/CapitalInjectionModal';
import CapitalHistoryModal from '@/components/CapitalHistoryModal'; // Added CapitalHistoryModal import

interface EquityItem {
    id: string;
    name: string;
    equity: number;
    totalContributed: number;
}

interface FinancialData {
    financials: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        totalProjectValue: number;
    };
    projects: {
        total: number;
        active: number;
        completed: number;
    };
    equity: EquityItem[];
}

export default function FinancialsPage() {
    const [data, setData] = useState<FinancialData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedPartnerHistory, setSelectedPartnerHistory] = useState<{ id: string, name: string } | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Fetch user ID deeply for the modal (In a real app, use AuthContext)
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await api.get('/auth/me');
                setCurrentUserId(res.data.partnerId); // Use partnerId for financial transactions
            } catch (e) {
                console.error("Failed to fetch user", e);
            }
        };
        fetchMe();
    }, []);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/company-summary');
            setData(res.data);
        } catch (err) {
            console.error("Financials fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Loading financial intelligence...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-rose-500">Failed to load financial data.</div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Company Finance</h1>
                    <p className="text-neutral-400 text-sm">Aggregated financial performance and equity distribution.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsInjectionModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Inject Capital
                    </button>
                    <button className="btn-outline flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">Revenue</span>
                    </div>
                    <p className="text-sm text-neutral-500">Total Income</p>
                    <h3 className="text-2xl font-bold text-white">₹{data.financials.totalRevenue.toLocaleString()}</h3>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-rose-500 uppercase tracking-wide">Expenses</span>
                    </div>
                    <p className="text-sm text-neutral-500">Total Spent</p>
                    <h3 className="text-2xl font-bold text-white">₹{data.financials.totalExpenses.toLocaleString()}</h3>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Net Profit</span>
                    </div>
                    <p className="text-sm text-neutral-500">Distributable</p>
                    <h3 className="text-2xl font-bold text-white">₹{data.financials.netProfit.toLocaleString()}</h3>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Projects</span>
                    </div>
                    <p className="text-sm text-neutral-500">Total Value</p>
                    <h3 className="text-2xl font-bold text-white">₹{data.financials.totalProjectValue.toLocaleString()}</h3>
                </div>
            </div>

            {/* Equity & Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Equity Table */}
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Partner Equity & Contribution
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-950/50 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Partner</th>
                                    <th className="px-6 py-4 text-right">Total Capital</th>
                                    <th className="px-6 py-4 text-right">Equity Share</th>
                                    <th className="px-6 py-4 text-right">Valuation (Est)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {data.equity.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-white">{partner.name}</div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPartnerHistory({ id: partner.id, name: partner.name });
                                                        setHistoryModalOpen(true);
                                                    }}
                                                    className="p-1 text-neutral-500 hover:text-indigo-400 transition-colors"
                                                    title="View Capital History"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-neutral-300">₹{(partner.totalContributed || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                {(partner.equity || 0).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                            ₹{(((data.financials?.netProfit || 0) * (partner.equity || 0)) / 100).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Project Status Overview */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-amber-500" />
                        Project Status
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Active Projects</span>
                                <span className="text-white font-medium">{data.projects.active}</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${(data.projects.active / data.projects.total) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Completed</span>
                                <span className="text-white font-medium">{data.projects.completed}</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500"
                                    style={{ width: `${(data.projects.completed / data.projects.total) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-neutral-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Total Projects</span>
                                <span className="text-white font-bold">{data.projects.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CapitalInjectionModal
                isOpen={isInjectionModalOpen}
                onClose={() => setIsInjectionModalOpen(false)}
                onSuccess={fetchFinancials}
                currentUserId={currentUserId}
                partners={data?.equity || []}
            />

            <CapitalHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                partnerId={selectedPartnerHistory?.id || ''}
                partnerName={selectedPartnerHistory?.name || ''}
                onDeleteSuccess={fetchFinancials}
            />
        </div>
    );
}
