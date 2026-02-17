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
                        <div key={task.id} className={`transition-all duration-300 ${expandedTaskId === task.id ? 'bg-neutral-900/50' : 'hover:bg-neutral-800/10'}`}>
                            {/* Task Row */}
                            <div
                                onClick={() => handleTaskClick(task.id)}
                                className={`p-4 group cursor-pointer border-l-2 flex flex-col gap-3 ${expandedTaskId === task.id ? 'border-l-indigo-500' : 'border-l-transparent'}`}
                            >
                                <div className="flex items-center justify-between">
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
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                            className="p-2 text-neutral-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${task.completionPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${task.completionPercent}%` }}
                                        />
                                    </div>
                                    <select
                                        value={task.completionPercent}
                                        onClick={(e) => e.stopPropagation()}
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
                        </div>
                    )) : (
                        <div className="p-12 text-center text-neutral-500 italic text-sm">No tasks found.</div>
                    )}
                </div>
            </div>

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
    );
}
