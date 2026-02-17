"use client";

import React from 'react';
import { User, Award, Percent } from 'lucide-react';

interface Contribution {
    partnerId: string;
    percentage: number;
    partner: {
        user: {
            name: string;
        };
    };
}

export default function ContributionList({ contributions }: { contributions: Contribution[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Contribution Ledger</h3>
                <span className="text-xs text-neutral-500 uppercase tracking-widest">Real-time stats</span>
            </div>

            {contributions.map((c) => (
                <div key={c.partnerId} className="glass-card p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-100">{c.partner.user.name}</p>
                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <Award className="w-3 h-3" /> Contribution Share
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-indigo-400 font-bold text-lg">
                            {c.percentage.toFixed(1)} <Percent className="w-4 h-4" />
                        </div>
                        <div className="w-24 h-1 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${Math.min(c.percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            ))}

            {contributions.length === 0 && (
                <div className="text-center p-8 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
                    <p className="text-neutral-500 text-sm italic">No contributions recorded yet.</p>
                </div>
            )}
        </div>
    );
}
