"use client";

import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    Clock, 
    List, 
    Star, 
    TrendingUp, 
    AlertCircle,
    Inbox,
    Zap
} from 'lucide-react';
import api from '@/lib/api';

export default function FreelancerDashboard() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [stats, setStats] = useState({ completed: 0, pending: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFreelancerData = async () => {
            try {
                const [tasksRes, statsRes] = await Promise.all([
                    api.get('/tasks'), // Assuming we have or will have a generic tasks list filtered by partner
                    api.get('/projects/tasks/stats')
                ]);
                setTasks(tasksRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching freelancer data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFreelancerData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm mb-1">Partner Workspace</h1>
                    <p className="text-neutral-400 text-sm font-light flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> Focus Mode: {stats.pending} Tasks Pending
                    </p>
                </div>
            </div>

            {/* Partner Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-white/5">
                        <Inbox className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Total Assigned</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-white/5">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{stats.completed}</p>
                    </div>
                </div>
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-white/5">
                        <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Pending Action</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-start gap-4 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:bg-white/[0.03] transition-all">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-white/5">
                        <Star className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 mb-1">Skill Weight</p>
                        <p className="text-2xl font-bold text-white tracking-tight">Expert</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tasks List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h2 className="font-semibold text-neutral-200 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Current Tasks
                            </h2>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-bold uppercase cursor-pointer hover:bg-white/10">Active</span>
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-bold uppercase cursor-pointer hover:bg-white/10">History</span>
                            </div>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="py-20 text-center text-neutral-500">Synchronizing workflow tasks...</div>
                            ) : tasks.length > 0 ? (
                                <div className="space-y-4">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-all border-l-4 border-l-blue-500/40">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                                                    <AlertCircle className={`w-4 h-4 ${task.status === 'BACKLOG' ? 'text-neutral-500' : 'text-blue-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{task.name}</p>
                                                    <p className="text-[10px] text-neutral-500 uppercase tracking-tighter mt-0.5">{task.project?.name || 'Project Unlinked'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 ml-12 sm:ml-0">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Weight</p>
                                                    <p className="text-xs text-neutral-300 font-medium">{task.effortWeight} pts</p>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                                    task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {task.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-neutral-500">You are currently at zero pending tasks. Excellent work.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contribution Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-[#0a0f16]/80 to-[#0a0f16]/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        <h2 className="font-semibold text-neutral-200 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            Efficiency Analytics
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                    <span>Task Consistency</span>
                                    <span className="text-emerald-400">92%</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                    <span>Avg. Turnaround</span>
                                    <span className="text-blue-400">1.4 Days</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-[78%] shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                                Request Feedback
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0a0f16]/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-2xl">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Latest Reward Points</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">450 XP</p>
                                    <p className="text-[10px] text-neutral-500 font-medium">Monthly Leaderboard</p>
                                </div>
                            </div>
                            <div className="text-xs text-neutral-400 font-medium underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Details</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
