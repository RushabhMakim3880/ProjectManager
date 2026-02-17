"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    UserPlus,
    CheckCircle2,
    Clock,
    AlertCircle,
    Layout,
    X,
    MessageSquare,
    Send,
    Star,
    Loader2,
    User,
    MoreVertical
} from 'lucide-react';
import api from '@/lib/api';

interface Task {
    id: string;
    name: string;
    category: string;
    status: string;
    effortWeight: number;
    assignedPartnerId: string | null;
    completionPercent: number;
    assignedPartner?: {
        user: {
            name: string;
        };
    };
    completedBy?: {
        name: string;
    };
    completedAt?: string;
}

interface TaskComment {
    id: string;
    user: {
        name: string;
    };
    content: string;
    type: 'COMMENT' | 'REVIEW';
    createdAt: string;
}

interface Partner {
    id: string;
    user: {
        id: string;
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
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [completerSelectionTask, setCompleterSelectionTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState<'COMMENT' | 'REVIEW'>('COMMENT');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [newTask, setNewTask] = useState({
        name: '',
        category: categories[0] || '',
        effortWeight: 1,
        assignedPartnerId: ''
    });

    const fetchComments = async (taskId: string) => {
        setLoadingComments(true);
        try {
            const res = await api.get(`/projects/tasks/${taskId}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleTaskClick = (taskId: string) => {
        if (expandedTaskId === taskId) {
            setExpandedTaskId(null);
        } else {
            setExpandedTaskId(taskId);
            fetchComments(taskId);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !expandedTaskId) return;
        setSubmittingComment(true);
        try {
            await api.post(`/projects/tasks/${expandedTaskId}/comments`, {
                content: newComment,
                type: commentType
            });
            setNewComment('');
            fetchComments(expandedTaskId);
        } catch (err) {
            console.error("Failed to add comment", err);
        } finally {
            setSubmittingComment(false);
        }
    };

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
        const task = tasks.find(t => t.id === taskId);
        if (percent === 100 && task?.status !== 'DONE') {
            setCompleterSelectionTask(task || null);
            return;
        }

        try {
            await api.patch(`/projects/tasks/${taskId}`, {
                completionPercent: percent
            });
            onTaskUpdate();
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    const handleConfirmCompletion = async (taskId: string, userId: string) => {
        try {
            await api.patch(`/projects/tasks/${taskId}`, {
                completionPercent: 100,
                status: 'DONE',
                completedById: userId
            });
            setCompleterSelectionTask(null);
            onTaskUpdate();
        } catch (err) {
            console.error("Failed to complete task", err);
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
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
                        <Layout className="w-5 h-5 text-indigo-500" />
                        Technical Execution Matrix
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1 ml-8">Scope Management & Resource Allocation</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    <Plus className="w-4 h-4" /> Initialize Task
                </button>
            </div>

            {isCreating && (
                <div className="glass-card p-8 border-indigo-500/30 bg-indigo-500/5 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Plus className="w-48 h-48" />
                    </div>
                    <form onSubmit={handleCreateTask} className="relative z-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Task Definition</label>
                                <input
                                    type="text"
                                    required
                                    value={newTask.name}
                                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white focus:border-indigo-500 transition-all outline-none placeholder:text-neutral-700 font-bold"
                                    placeholder="Define the technical objective..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Classification</label>
                                    <select
                                        value={newTask.category}
                                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white focus:border-indigo-500 transition-all outline-none capitalize font-bold appearance-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Effort Matrix (1-10)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="100"
                                        value={newTask.effortWeight}
                                        onChange={(e) => setNewTask({ ...newTask, effortWeight: Number(e.target.value) })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white focus:border-indigo-500 transition-all outline-none font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Lead Assignment</label>
                                <select
                                    value={newTask.assignedPartnerId}
                                    onChange={(e) => setNewTask({ ...newTask, assignedPartnerId: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white focus:border-indigo-500 transition-all outline-none font-bold appearance-none"
                                >
                                    <option value="">Select Operational Partner</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>{p.user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-3 md:w-80">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-5 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                >
                                    Commit Task
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden bg-neutral-900/20 border-neutral-800/50">
                <div className="divide-y divide-neutral-800/50">
                    {tasks.length > 0 ? (
                        tasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`transition-all duration-300 ${expandedTaskId === task.id ? 'bg-indigo-500/[0.03]' : 'hover:bg-neutral-800/20'}`}
                            >
                                {/* Task Row */}
                                <div
                                    onClick={() => handleTaskClick(task.id)}
                                    className={`p-5 group cursor-pointer border-l-4 flex flex-col gap-4 ${expandedTaskId === task.id ? 'border-l-indigo-500' : 'border-l-transparent'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-2.5 rounded-xl border-2 transition-all group-hover:scale-110 ${task.completionPercent === 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                <CheckCircle2 className="w-5 h-5 shadow-[0_0_10px_currentColor]" />
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-white leading-none tracking-tight">{task.name}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-neutral-950 text-neutral-500 uppercase tracking-widest border border-neutral-800">{task.category}</span>
                                                    <span className="text-[9px] font-black text-indigo-400 flex items-center gap-1.5 uppercase tracking-widest italic">
                                                        <Clock className="w-3 h-3" /> Effort Index: {task.effortWeight}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1.5">Asset Assigned</p>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-[10px] text-indigo-400">
                                                        {task.assignedPartner?.user?.name?.charAt(0) || <User className="w-3 h-3" />}
                                                    </div>
                                                    <span className="text-xs font-black text-neutral-300 tracking-tight">{task.assignedPartner?.user?.name || 'Open Pool'}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                className="p-2.5 text-neutral-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-500/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 px-2">
                                        <div className="flex-1 h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${task.completionPercent}%` }}
                                                className={`h-full transition-all duration-700 shadow-[0_0_15px_rgba(99,102,241,0.3)] ${task.completionPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={task.completionPercent}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleUpdateProgress(task.id, Number(e.target.value))}
                                                className="bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5 text-[10px] font-black text-indigo-400 outline-none hover:border-indigo-500/50 transition-all cursor-pointer appearance-none text-center min-w-[40px]"
                                            >
                                                <option value="0">0%</option>
                                                <option value="25">25%</option>
                                                <option value="50">50%</option>
                                                <option value="75">75%</option>
                                                <option value="100">100%</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details Layer */}
                                <AnimatePresence>
                                    {expandedTaskId === task.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-neutral-800 bg-neutral-950/40"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Completion Info */}
                                                {task.status === 'DONE' && (
                                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest leading-none mb-1">Completed By</p>
                                                            <p className="text-sm font-bold text-emerald-400">{task.completedBy?.name || 'System User'}</p>
                                                            {task.completedAt && (
                                                                <p className="text-[9px] text-neutral-500 font-medium">
                                                                    {new Date(task.completedAt).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Comments Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        Activity & Reviews
                                                    </h4>

                                                    <div className="space-y-3">
                                                        {loadingComments ? (
                                                            <div className="py-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-neutral-500" /></div>
                                                        ) : comments.length === 0 ? (
                                                            <p className="text-xs text-neutral-600 italic px-2">No activity recorded for this task.</p>
                                                        ) : (
                                                            comments.map(c => (
                                                                <div key={c.id} className={`p-3 rounded-xl border ${c.type === 'REVIEW' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-neutral-900 border-neutral-800'}`}>
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-[10px] font-bold text-indigo-400">{c.user.name}</span>
                                                                        <span className="text-[9px] text-neutral-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-xs text-neutral-400 leading-relaxed">{c.content}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="mt-4 flex flex-col gap-3">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setCommentType('COMMENT')}
                                                                className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${commentType === 'COMMENT' ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}
                                                            >
                                                                Comment
                                                            </button>
                                                            <button
                                                                onClick={() => setCommentType('REVIEW')}
                                                                className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${commentType === 'REVIEW' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'}`}
                                                            >
                                                                Review
                                                            </button>
                                                        </div>
                                                        <div className="relative">
                                                            <textarea
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                placeholder={`Add a ${commentType.toLowerCase()}...`}
                                                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 pr-10 text-xs text-white focus:border-indigo-500 outline-none resize-none transition-all"
                                                            />
                                                            <button
                                                                onClick={handleAddComment}
                                                                disabled={submittingComment || !newComment.trim()}
                                                                className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50 transition-all"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-neutral-500 italic text-sm font-bold uppercase tracking-widest">No Operational Tasks In Backlog</div>
                    )}
                    {/* Completer Selection Modal */}
                    <AnimatePresence>
                        {completerSelectionTask && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setCompleterSelectionTask(null)}
                                    className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
                                >
                                    <h3 className="text-lg font-bold text-white mb-1">Verify Completion</h3>
                                    <p className="text-sm text-neutral-500 mb-6">Who actually completed this work? (Attribution will change performance share)</p>

                                    <div className="space-y-2 mb-6">
                                        {partners.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleConfirmCompletion(completerSelectionTask.id, p.user.id)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-800 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-xs text-indigo-400 group-hover:bg-indigo-500/20">
                                                    {p.user.name[0]}
                                                </div>
                                                <span className="text-sm font-bold text-neutral-200">{p.user.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCompleterSelectionTask(null)}
                                        className="w-full py-2.5 text-sm font-bold text-neutral-500 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
