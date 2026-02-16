"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';

interface Financials {
    totalValue: number;
    businessReserve: number;
    religiousAllocation: number;
    netDistributable: number;
    basePool: number;
    performancePool: number;
}

export default function FinancialVisualizer({ financials }: { financials: Financials }) {
    const pools = [
        { name: 'Business (10%)', value: financials.businessReserve, color: 'bg-indigo-500' },
        { name: 'Religious (5%)', value: financials.religiousAllocation, color: 'bg-amber-500' },
        { name: 'Partners (85%)', value: financials.netDistributable, color: 'bg-emerald-500' },
    ];

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Profit Allocation Model</h3>

            <div className="space-y-6">
                <div className="flex h-4 w-full rounded-full overflow-hidden bg-neutral-800">
                    {pools.map((pool, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ width: 0 }}
                            animate={{ width: `${(pool.value / financials.totalValue) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.2 }}
                            className={`${pool.color} h-full tooltip`}
                            title={pool.name}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pools.map((pool, idx) => (
                        <div key={idx} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${pool.color}`} />
                                <span className="text-xs text-neutral-500 font-medium">{pool.name}</span>
                            </div>
                            <p className="text-lg font-bold text-white">{formatCurrency(pool.value)}</p>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-widest">Base Pool (20%)</p>
                        <p className="text-xl font-bold text-neutral-300">{formatCurrency(financials.basePool)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest">Performance (80%)</p>
                        <p className="text-xl font-bold text-indigo-400">{formatCurrency(financials.performancePool)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
