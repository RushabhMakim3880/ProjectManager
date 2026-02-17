"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Plus, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDrop = async (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        try {
            await api.put(`/projects/tasks/${taskId}`, { status });
            onTaskUpdate();
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
                                        >
                                            <div
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                className="glass-card !p-3 cursor-grab active:cursor-grabbing relative overflow-hidden h-full"
                                            >
                                                {/* Accent line */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${column.bg.replace('/10', '')}`} />

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
        </div>
    );
};
