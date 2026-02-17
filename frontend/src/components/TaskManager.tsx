"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    UserPlus,
    CheckCircle2,
    Clock,
    AlertCircle,
    Layout
} from 'lucide-react';
import api from '@/lib/api';

interface Task {
    id: string;
    name: string;
    category: string;
    effortWeight: number;
    assignedPartnerId: string | null;
    completionPercent: number;
    assignedPartner?: {
        user: {
            name: string;
        };
    };
}

interface Partner {
    id: string;
    user: {
        name: string;
    };
}

interface TaskManagerProps {
    projectId: string;
    tasks: Task[];
    categories: string[];
    onTaskUpdate: () => void;
}

export default function TaskManager({ projectId, tasks, categories, onTaskUpdate }: TaskManagerProps) {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTask, setNewTask] = useState({
        name: '',
        category: categories[0] || '',
        effortWeight: 1,
        assignedPartnerId: ''
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await api.get('/partners');
                setPartners(res.data);
            } catch (err) {
                console.error("Failed to fetch partners", err);
            }
        };
        fetchPartners();
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/projects/tasks', {
                projectId,
                ...newTask,
                assignedPartnerId: newTask.assignedPartnerId || null
            });
            setIsCreating(false);
            setNewTask({
                name: '',
                category: categories[0] || '',
                effortWeight: 1,
                assignedPartnerId: ''
            });
            onTaskUpdate();
        } catch (err) {
            console.error("Failed to create task", err);
        }
    };

    const handleUpdateProgress = async (taskId: string, percent: number) => {
        try {
            await api.patch(`/projects/tasks/${taskId}`, {
                completionPercent: percent
            });
            onTaskUpdate();
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/projects/tasks/${taskId}`);
            onTaskUpdate();
        } catch (err) {
            console.error("Failed to delete task", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-indigo-400" />
                    Project Task Backlog
                </h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>

            {isCreating && (
                <div className="glass-card p-6 border-indigo-500/30 animate-in slide-in-from-top-2 duration-300">
                    <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Task Name</label>
                            <input
                                type="text"
                                required
                                value={newTask.name}
                                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all outline-none"
                                placeholder="e.g. Implement Auth Flow"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Category</label>
                            <select
                                value={newTask.category}
                                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all outline-none capitalize"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Effort (1-10)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="100"
                                value={newTask.effortWeight}
                                onChange={(e) => setNewTask({ ...newTask, effortWeight: Number(e.target.value) })}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Assign To</label>
                            <select
                                value={newTask.assignedPartnerId}
                                onChange={(e) => setNewTask({ ...newTask, assignedPartnerId: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-all outline-none"
                            >
                                <option value="">Select Partner</option>
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 btn-outline py-2.5 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn-primary py-2.5 text-sm overflow-hidden"
                            >
                                Save Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="divide-y divide-neutral-800">
                    {tasks.length > 0 ? tasks.map((task) => (
                        <div key={task.id} className="p-4 hover:bg-neutral-800/10 transition-colors group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${task.completionPercent === 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight">{task.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase">{task.category}</span>
                                            <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Effort: {task.effortWeight}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Assigned To</p>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                                <UserPlus className="w-3 h-3 text-neutral-500" />
                                            </div>
                                            <span className="text-xs font-medium text-white">{task.assignedPartner?.user?.name || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 text-neutral-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${task.completionPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${task.completionPercent}%` }}
                                    />
                                </div>
                                <select
                                    value={task.completionPercent}
                                    onChange={(e) => handleUpdateProgress(task.id, Number(e.target.value))}
                                    className="bg-transparent text-[10px] font-bold text-neutral-400 outline-none hover:text-white transition-colors"
                                >
                                    <option value="0">0%</option>
                                    <option value="25">25%</option>
                                    <option value="50">50%</option>
                                    <option value="75">75%</option>
                                    <option value="100">100%</option>
                                </select>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-neutral-500 text-xs italic">No tasks created yet. Start by adding one above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
