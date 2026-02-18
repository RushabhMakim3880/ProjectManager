"use client";

import React from 'react';
import { User, Award, Percent } from 'lucide-react';

interface Contribution {
    partnerId: string;
    percentage: number;
    tasksCompleted?: number;
    totalTasks?: number;
    earnings?: number;
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

            {contributions.map((c) => {
                const didNoWork = c.percentage === 0;
                return (
                    <div key={c.partnerId} className={`glass-card p-4 flex items-center justify-between group ${didNoWork ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full bg-neutral-800 border flex items-center justify-center ${didNoWork ? 'border-neutral-800' : 'border-neutral-700'}`}>
                                <User className={`w-5 h-5 ${didNoWork ? 'text-neutral-600' : 'text-neutral-400'}`} />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-100 whitespace-nowrap truncate max-w-[140px]">{c.partner.user.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] text-neutral-500 flex items-center gap-1 uppercase font-bold tracking-tighter">
                                        <Award className={`w-3 h-3 ${didNoWork ? 'text-neutral-600' : 'text-indigo-500'}`} /> {c.tasksCompleted || 0}/{c.totalTasks || 0} Tasks
                                    </p>
                                    <p className={`text-[10px] flex items-center gap-1 uppercase font-bold tracking-tighter px-1.5 py-0.5 rounded ${didNoWork ? 'text-neutral-600 bg-neutral-800/50' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                        ₹{(c.earnings || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={`flex items-center justify-end gap-1 font-bold text-lg leading-none ${didNoWork ? 'text-neutral-600' : 'text-indigo-400'}`}>
                                {c.percentage.toFixed(1)}<span className="text-xs font-medium mt-1">%</span>
                            </div>
                            <div className="w-20 h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden ml-auto">
                                <div
                                    className={`h-full transition-all duration-1000 ${didNoWork ? 'bg-neutral-700' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(c.percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            {contributions.length === 0 && (
                <div className="text-center p-8 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
                    <p className="text-neutral-500 text-sm italic">No contributions recorded yet.</p>
                </div>
            )}
        </div>
    );
}
