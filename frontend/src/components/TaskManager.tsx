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
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
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

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

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
        setSelectedTaskId(taskId);
        fetchComments(taskId);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedTaskId) return;
        setSubmittingComment(true);
        try {
            await api.post(`/projects/tasks/${selectedTaskId}/comments`, {
                content: newComment,
                type: commentType
            });
            setNewComment('');
            fetchComments(selectedTaskId);
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
                        <div
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className={`p-4 hover:bg-neutral-800/10 transition-colors group cursor-pointer border-l-2 ${selectedTaskId === task.id ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-l-transparent'}`}
                        >
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

            {/* Task Details Sidebar */}
            <AnimatePresence>
                {selectedTaskId && selectedTask && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTaskId(null)}
                            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 border-l border-neutral-800 z-50 shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md sticky top-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700">
                                            {selectedTask.category}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${selectedTask.status === 'DONE' ? 'bg-emerald-400' : selectedTask.status === 'IN_PROGRESS' ? 'bg-indigo-400' : 'bg-neutral-500'}`} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-tight">{selectedTask.name}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTaskId(null)}
                                    className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {/* Attribution Section */}
                                {selectedTask.status === 'DONE' && (
                                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-emerald-500/60 uppercase tracking-widest">Completed By</p>
                                            <p className="text-sm font-bold text-emerald-400">
                                                {selectedTask.completedBy?.name || 'System User'}
                                            </p>
                                            {selectedTask.completedAt && (
                                                <p className="text-[10px] text-emerald-600 font-medium">
                                                    {new Date(selectedTask.completedAt).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Task Assignment
                                    </h3>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                            {selectedTask.assignedPartner?.user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-200">{selectedTask.assignedPartner?.user.name || 'Unassigned'}</p>
                                            <p className="text-[10px] text-neutral-500 uppercase font-black">Designated Worker</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="space-y-4 pt-4 border-t border-neutral-800/50">
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Discussion & Reviews
                                    </h3>

                                    <div className="space-y-4">
                                        {loadingComments ? (
                                            <div className="py-8 flex flex-col items-center justify-center gap-3 text-neutral-600">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <p className="text-xs font-bold uppercase tracking-tighter">Loading conversation...</p>
                                            </div>
                                        ) : comments.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                                <div className="p-4 rounded-full bg-neutral-950 border border-neutral-800 mb-4 opacity-50">
                                                    <MessageSquare className="w-6 h-6 text-neutral-700" />
                                                </div>
                                                <p className="text-sm font-bold text-neutral-500">No activity yet</p>
                                                <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-widest font-black">Be the first to comment or review</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {comments.map((comment) => (
                                                    <div key={comment.id} className={`group flex flex-col gap-1.5 p-3 rounded-2xl transition-all ${comment.type === 'REVIEW' ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-neutral-950 border border-neutral-800'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-neutral-200">{comment.user.name}</span>
                                                                {comment.type === 'REVIEW' && (
                                                                    <span className="text-[8px] font-black uppercase tracking-tighter bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded">Review</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] font-medium text-neutral-600">
                                                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: 'numeric',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-neutral-400 leading-relaxed font-medium">{comment.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Comment Input */}
                            <div className="p-6 bg-neutral-950/80 backdrop-blur-md border-t border-neutral-800">
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => setCommentType('COMMENT')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${commentType === 'COMMENT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        Comment
                                    </button>
                                    <button
                                        onClick={() => setCommentType('REVIEW')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${commentType === 'REVIEW' ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                                    >
                                        <Star className="w-3 h-3" />
                                        Review
                                    </button>
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={`Add a ${commentType.toLowerCase()}...`}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 pr-12 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none min-h-[100px]"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={submittingComment || !newComment.trim()}
                                        className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                                    >
                                        {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
