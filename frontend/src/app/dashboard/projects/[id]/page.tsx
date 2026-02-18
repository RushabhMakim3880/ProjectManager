"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Settings,
    Lock,
    RefreshCw,
    Briefcase,
    Users,
    FileText,
    Activity,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    Mail,
    MapPin,
    Trophy,
    DollarSign,
    Receipt, // Added Receipt icon
    ChevronRight,
    Plus,
    Layout,
    Target,
    LockOpen,
    Edit3
} from 'lucide-react';
import ContributionList from '@/components/ContributionList';
import FinancialVisualizer from '@/components/FinancialVisualizer';
import TaskManager from '@/components/TaskManager';
import FinancialBreakdown from '@/components/FinancialBreakdown';
import ProjectLedger from '@/components/ProjectLedger';
import CreateProjectModal from '@/components/CreateProjectModal';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/currency';

export default function ProjectDetailsPage() {
    const params = useParams() as any;
    const { id } = params;
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('financials');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [totalPartnerCount, setTotalPartnerCount] = useState(1);
    const [allPartners, setAllPartners] = useState<any[]>([]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (err) {
            console.error("Failed to fetch project", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        // Fetch total partner count for base pay calculation
        api.get('/partners').then(res => {
            const partners = Array.isArray(res.data) ? res.data : [];
            setTotalPartnerCount(partners.length || 1);
            setAllPartners(partners);
        }).catch(() => { });
    }, [id]);

    const handleRecalculate = async () => {
        try {
            setLoading(true);
            await api.post(`/projects/${id}/recalculate`);
            await fetchProject();
        } catch (err) {
            console.error("Recalculation failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!confirm("Are you sure you want to finalize this engagement? This will lock the project and prevent further edits.")) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await api.patch(`/projects/${id}/lock`);
            await fetchProject();
        } catch (error) {
            console.error('Failed to lock project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async () => {
        if (!confirm("Are you sure you want to unlock this project?")) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await api.patch(`/projects/${id}/unlock`);
            await fetchProject();
        } catch (error) {
            console.error('Failed to unlock project:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h2 className="text-xl font-bold text-white">Project Not Found</h2>
                <button onClick={() => router.push('/dashboard/projects')} className="mt-4 text-indigo-400 hover:underline">Return to Projects</button>
            </div>
        );
    }

    // Default weights if not present
    const weights = project.weights ? (typeof project.weights === 'string' ? JSON.parse(project.weights) : project.weights) : {};

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push('/dashboard/projects')}
                        className="p-3 hover:bg-neutral-800 rounded-2xl transition-all border border-neutral-800 group"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{project.projectIdCustom || 'PROJECT'}</span>
                            {project.isLocked && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> LOCKED
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
                        <p className="text-neutral-500 flex items-center gap-2 mt-1">
                            <Briefcase className="w-4 h-4" />
                            {project.clientName} • {project.projectType}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!project.isLocked && (
                        <button
                            onClick={() => {
                                setEditingProject(project);
                                setShowEditModal(true);
                            }}
                            className="btn-outline flex items-center gap-2 px-4"
                            title="Edit Project Configuration"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={handleRecalculate}
                        disabled={project.isLocked}
                        className="btn-outline flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className="w-4 h-4" /> Recalculate
                    </button>

                    {project.isLocked ? (
                        <button
                            onClick={handleUnlock}
                            className="btn-outline border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 px-8 shadow-lg shadow-amber-500/10"
                        >
                            <LockOpen className="w-4 h-4" /> Unlock Project
                        </button>
                    ) : (
                        <button
                            onClick={handleFinalize}
                            className="btn-primary flex items-center gap-2 px-8 shadow-lg shadow-indigo-500/20"
                        >
                            <Lock className="w-4 h-4" /> Finalize Engagement
                        </button>
                    )}
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-900/50 rounded-2xl border border-neutral-800 w-fit">
                {[
                    { id: 'financials', label: 'Financials', icon: Activity },
                    { id: 'technical', label: 'Technical Scope', icon: FileText },
                    { id: 'client', label: 'Engagement', icon: Users },
                    { id: 'team', label: 'Team & Logic', icon: Settings },
                    { id: 'earnings', label: 'Financial Breakdown', icon: DollarSign },
                    { id: 'ledger', label: 'Payments & Ledger', icon: Receipt }, // Added new tab
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`${activeTab === 'earnings' || activeTab === 'ledger' ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
                    {activeTab === 'financials' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <FinancialVisualizer financials={project.financialRecords?.[0] || {
                                totalValue: project.totalValue,
                                businessReserve: project.totalValue * 0.1,
                                religiousAllocation: project.totalValue * 0.05,
                                netDistributable: project.totalValue * 0.85,
                                basePool: project.totalValue * 0.85 * 0.2,
                                performancePool: project.totalValue * 0.85 * 0.8
                            }} />

                            <div className="glass-card overflow-hidden">
                                <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        Project Milestones
                                    </h3>
                                </div>
                                <div className="divide-y divide-neutral-800">
                                    {project.milestones?.length > 0 ? project.milestones.map((m: any) => (
                                        <div key={m.id} className="p-6 flex items-center justify-between hover:bg-neutral-800/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-500'}`}>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{m.name}</p>
                                                    <p className="text-xs text-neutral-500">{m.deliverables}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{new Date(m.dueDate).toLocaleDateString()}</p>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{m.status}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-12 text-center text-neutral-500 text-sm italic">
                                            No milestones defined for this engagement.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'technical' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6 border-l-4 border-l-indigo-500">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Tech Stack & Environments</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Infrastructure</p>
                                            <p className="text-sm text-white font-medium">{project.techStack || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Target Environments</p>
                                            <p className="text-sm text-white font-medium">{project.environments || 'Standard'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-l-4 border-l-amber-500">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Risk & Requirements</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Risk Level</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${project.riskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                                                }`}>{project.riskLevel || 'LOW'}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Access Requirements</p>
                                            <p className="text-sm text-white font-medium">{project.accessReqs || 'Standard VPN'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Workflow Management</h4>
                                </div>

                                <TaskManager
                                    projectId={id}
                                    tasks={project.tasks || []}
                                    categories={Object.keys(weights)}
                                    onTaskUpdate={fetchProject}
                                />
                            </div>

                            <div className="glass-card p-8 space-y-8">
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-3">Project Objectives</h4>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{project.objectives || project.description || 'No objectives defined.'}</p>
                                </div>
                                <div className="pt-6 border-t border-neutral-800">
                                    <h4 className="text-sm font-bold text-white mb-3">Core Deliverables</h4>
                                    <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{project.deliverables || 'N/A'}</p>
                                </div>
                                <div className="pt-6 border-t border-neutral-800">
                                    <h4 className="text-sm font-bold text-rose-400 mb-3">Out of Scope</h4>
                                    <p className="text-neutral-500 text-sm italic">{project.outOfScope || 'Standard exclusions apply.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'client' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Contact Profile</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-neutral-800 rounded-lg"><Users className="w-4 h-4 text-neutral-400" /></div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Primary Contact</p>
                                                <p className="text-sm text-white font-semibold">{project.clientContact || 'Not assigned'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-neutral-800 rounded-lg"><Mail className="w-4 h-4 text-neutral-400" /></div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Email Address</p>
                                                <p className="text-sm text-white font-semibold text-indigo-400">{project.clientEmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-neutral-800 rounded-lg"><MapPin className="w-4 h-4 text-neutral-400" /></div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Timezone & Location</p>
                                                <p className="text-sm text-white font-semibold">{project.timezone || 'GMT+5:30'} • {project.location || 'Remote'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-6">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Compliance Status</h4>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-400">NDA Signed</span>
                                            {project.ndaSigned ? (
                                                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                                                    <CheckCircle2 className="w-4 h-4" /> SIGNED
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                                                    <Clock className="w-4 h-4" /> PENDING
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-neutral-800">
                                            <button className="w-full btn-outline text-xs py-2 flex items-center justify-center gap-2">
                                                <FileText className="w-3 h-3" /> View Contract Document
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="glass-card p-6">
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Tracking Configuration</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                                            <span className="text-sm text-neutral-400">Contribution Tracking</span>
                                            <span className="text-xs font-bold text-emerald-500">{project.enableContributionTracking ? 'ENABLED' : 'DISABLED'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                                            <span className="text-sm text-neutral-400">Task Logging</span>
                                            <span className="text-xs font-bold text-indigo-400">{project.enableTaskLogging ? 'ENABLED' : 'DISABLED'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                                            <span className="text-sm text-neutral-400">Effort Scale</span>
                                            <span className="text-xs font-bold text-neutral-400">{project.effortScale || 'FIBONACCI'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                                            <span className="text-sm text-neutral-400">Category Locking</span>
                                            <span className="text-xs font-bold text-neutral-500">{project.lockWeights ? 'LOCKED' : 'FLEXIBLE'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                                            <span className="text-sm text-neutral-400">Visibility</span>
                                            <span className="text-xs font-bold text-neutral-400">{project.visibility || 'INTERNAL'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                                            <span className="text-sm text-neutral-400">Auto-Lock System</span>
                                            <span className="text-xs font-bold text-indigo-400">{project.autoLock ? 'ACTIVE' : 'INACTIVE'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Distribution Model (Weights)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {Object.entries(weights).map(([cat, weight]) => (
                                        <div key={cat} className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-800 text-center">
                                            <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1 truncate">{cat}</p>
                                            <p className="text-lg font-bold text-white">{weight as number}%</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <FinancialBreakdown project={project} totalPartnerCount={totalPartnerCount} allPartners={allPartners} />
                    )}

                    {activeTab === 'ledger' && (
                        <ProjectLedger projectId={params.id} onUpdate={fetchProject} />
                    )}
                </div>

                {(activeTab !== 'earnings' && activeTab !== 'ledger') && (
                    <div className="lg:col-span-4 space-y-8">
                        <ContributionList contributions={(project.contributions || []).map((c: any) => {
                            const partnerTasks = (project.tasks || []).filter((t: any) => t.assignedPartnerId === c.partnerId);
                            const completedCount = partnerTasks.filter((t: any) => t.completionPercent === 100).length;
                            const performancePool = project.financialRecords?.[0]?.performancePool || (project.totalValue * 0.85 * 0.8);
                            const earnings = (c.percentage / 100) * performancePool;

                            return {
                                ...c,
                                tasksCompleted: completedCount,
                                totalTasks: partnerTasks.length,
                                earnings: earnings
                            };
                        })} />

                        <div className="glass-card p-6">
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Engagement Pulse</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-neutral-500" />
                                    <span className="text-neutral-400">Launched:</span>
                                    <span className="text-neutral-100 font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Info className="w-4 h-4 text-neutral-500" />
                                    <span className="text-neutral-400">Priority:</span>
                                    <span className={`font-bold ${project.priority === 'CRITICAL' ? 'text-rose-500' :
                                        project.priority === 'HIGH' ? 'text-amber-500' : 'text-indigo-400'
                                        }`}>{project.priority}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Activity className="w-4 h-4 text-neutral-500" />
                                    <span className="text-neutral-400">Project Type:</span>
                                    <span className="text-neutral-100 font-medium">{project.projectType}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 border-dashed">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" />
                                Security Leads
                            </h4>
                            <div className="space-y-4 mt-4">
                                {(() => {
                                    const getLeadName = (leadId: string) => {
                                        if (!leadId) return "Unassigned";
                                        // Try contribution first
                                        const contribution = (project.contributions || []).find((c: any) => c.partnerId === leadId);
                                        if (contribution?.partner?.user?.name) return contribution.partner.user.name;

                                        // Fallback to partner list if available (we might need to fetch partners or ensure they are joined)
                                        // For now, let's assume the backend sync will fix most cases, but we can add a fallback check
                                        return contribution?.partner?.user?.name || "Unassigned";
                                    };

                                    return (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-500">Project Lead</span>
                                                <span className="text-xs text-neutral-300 font-medium">{getLeadName(project.projectLeadId)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-500">Technical Lead</span>
                                                <span className="text-xs text-neutral-300 font-medium">{getLeadName(project.techLeadId)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-500">QA Lead</span>
                                                <span className="text-xs text-neutral-300 font-medium">{getLeadName(project.qaLeadId)}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showEditModal && (
                <CreateProjectModal
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingProject(null);
                        fetchProject(); // Refresh data after edit
                    }}
                    initialData={editingProject}
                />
            )}
        </div>
    );
}
