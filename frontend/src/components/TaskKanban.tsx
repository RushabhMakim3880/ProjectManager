"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MoreVertical,
    Plus,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    MessageSquare,
    Send,
    Star,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface Task {
    id: string;
    name: string;
    category: string;
    status: string;
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
    description?: string;
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

interface TaskKanbanProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    projectId: string;
}

const COLUMNS = [
    { id: 'BACKLOG', label: 'Backlog', color: 'text-neutral-500', bg: 'bg-neutral-500/10' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'REVIEW', label: 'Review', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'DONE', label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
];

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onTaskUpdate, projectId }) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState<'COMMENT' | 'REVIEW'>('COMMENT');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

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

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDrop = async (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        try {
            await api.patch(`/projects/tasks/${taskId}`, { status });
            onTaskUpdate();
            if (selectedTaskId === taskId) {
                // Refresh sidebar if currently open
                onTaskUpdate();
            }
        } catch (err) {
            console.error("Failed to update task status", err);
        }
        setDraggedTaskId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full min-h-[600px]">
            {COLUMNS.map(column => (
                <div
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className="flex flex-col gap-3 h-full"
                >
                    <div className="flex items-center justify-between px-2 mb-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${column.bg.replace('/10', '')}`} />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                {column.label}
                            </h3>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-500">
                                {tasks.filter(t => t.status === column.id).length}
                            </span>
                        </div>
                    </div>

                    <div className={`flex-1 rounded-2xl border border-dashed border-neutral-800 p-2 transition-colors ${draggedTaskId ? 'bg-neutral-900/30' : ''}`}>
                        <div className="flex flex-col gap-3">
                            <AnimatePresence mode="popLayout">
                                {tasks
                                    .filter(task => task.status === column.id)
                                    .map(task => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group relative"
                                            onClick={() => handleTaskClick(task.id)}
                                        >
                                            <div
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                className={`glass-card !p-3 cursor-pointer active:cursor-grabbing relative overflow-hidden h-full transition-all border-l-2 ${selectedTaskId === task.id ? 'ring-1 ring-indigo-500 bg-indigo-500/5' : ''}`}
                                                style={{ borderLeftColor: COLUMNS.find(c => c.id === task.status)?.color.replace('text-', '') }}
                                            >

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between">
                                                        <span className="text-[10px] font-bold uppercase text-neutral-600 bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-800">
                                                            {task.category}
                                                        </span>
                                                        <button className="text-neutral-600 hover:text-white transition-colors">
                                                            <MoreVertical className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <h4 className="text-sm font-bold text-neutral-200 line-clamp-2 uppercase">
                                                        {task.name}
                                                    </h4>

                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/50">
                                                        <div className="flex items-center gap-2 text-neutral-500">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-[10px] font-medium">
                                                                {task.assignedPartner?.user.name || 'Unassigned'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                                                            <Clock className="w-2.5 h-2.5 text-indigo-500" />
                                                            <span className="text-[10px] font-bold text-indigo-300">
                                                                {task.completionPercent}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            ))}
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
                                        <div className={`w-2 h-2 rounded-full ${COLUMNS.find(c => c.id === selectedTask.status)?.bg.replace('/10', '')}`} />
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
};
