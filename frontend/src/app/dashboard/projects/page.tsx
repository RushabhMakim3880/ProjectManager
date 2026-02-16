"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Calendar,
    IndianRupee, Briefcase, ChevronRight, BarChart3,
    Clock, Trash2, Edit3, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import CreateProjectModal from '@/components/CreateProjectModal';
import api from '@/lib/api';

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<any>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete project "${name}"? This action is irreversible.`)) {
            try {
                await api.delete(`/projects/${id}`);
                fetchProjects();
            } catch (err) {
                console.error("Delete failed", err);
                alert("Failed to delete project. Please try again.");
            }
        }
    };

    const filteredProjects = projects.filter(prj =>
        prj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prj.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Project Portfolio</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage and track your strategic engagements</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProject(null);
                        setShowCreateModal(true);
                    }}
                    className="btn-primary flex items-center gap-2 px-6"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Projects', value: projects.filter(p => p.status === 'ACTIVE').length, icon: Briefcase, color: 'text-indigo-400' },
                    { label: 'Total Value', value: `₹${(projects.reduce((acc, p) => acc + (p.totalValue || 0), 0) / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-emerald-400' },
                    { label: 'Completion', value: '68%', icon: BarChart3, color: 'text-amber-400' },
                    { label: 'On Hold', value: projects.filter(p => p.status === 'ON_HOLD').length, icon: Clock, color: 'text-rose-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex items-center gap-4 group hover:border-white/10 transition-all">
                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search projects or clients..."
                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-semibold">Filter</span>
                </button>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="glass-card group hover:border-indigo-500/30 transition-all flex flex-col overflow-hidden">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                            project.status === 'PLANNED' ? 'bg-indigo-500/10 text-indigo-400' :
                                                'bg-rose-500/10 text-rose-400'
                                        }`}>
                                        {project.status}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingProject(project);
                                                setShowCreateModal(true);
                                            }}
                                            className="p-2 text-neutral-500 hover:text-indigo-400 hover:bg-neutral-800 rounded-lg transition-all"
                                            title="Edit Project"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id, project.name)}
                                            className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-all"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <Link href={`/dashboard/projects/${project.id}`}>
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5 font-medium">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {project.clientName}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Budget</p>
                                            <p className="text-white font-bold flex items-center">
                                                <IndianRupee className="w-3 h-3" />
                                                {(project.totalValue || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Project Type</p>
                                            <p className="text-white font-bold text-xs">{project.projectType || 'VAPT'}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">
                                        {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-neutral-900 bg-neutral-800 overflow-hidden ring-2 ring-indigo-500/10">
                                            <img src={`https://i.pravatar.cc/150?u=${i + project.id}`} alt="Team" className="w-full h-full object-cover grayscale opacity-80" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <p className="text-neutral-500">No projects found matching your search.</p>
                </div>
            )}

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingProject(null);
                        fetchProjects();
                    }}
                    initialData={editingProject}
                />
            )}
        </div>
    );
}
