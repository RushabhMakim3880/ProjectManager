"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    X, Save, Calendar, IndianRupee, ListTodo,
    Briefcase, Users, Link, Shield, Settings,
    AlertTriangle, CheckCircle2, ChevronRight,
    ChevronLeft, Plus, Trash2, Globe, Clock,
    Lock, Eye, Activity, FileText
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { PROJECT_DOMAINS, PROJECT_SERVICES } from '@/lib/project-types';

interface Milestone {
    name: string;
    dueDate: string;
    deliverables: string;
    status: string;
}

const TABS = [
    { id: 'general', label: 'General', icon: Briefcase },
    { id: 'client', label: 'Client', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'scope', label: 'Scope', icon: FileText },
    { id: 'team', label: 'Team', icon: Shield },
    { id: 'weights', label: 'Weights', icon: Activity },
    { id: 'logging', label: 'Tracking', icon: Clock },
    { id: 'controls', label: 'Controls', icon: Lock },
];

export default function CreateProjectModal({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Core Identification
        name: '',
        clientName: '',
        totalValue: 0,
        startDate: '',
        endDate: '',
        description: '',
        projectType: '',
        category: '',
        priority: 'MEDIUM',
        status: 'PLANNED',

        // Client & Engagement
        clientContact: '',
        clientEmail: '',
        clientPhone: '',
        whatsappNumber: '',
        commsChannel: 'WhatsApp',
        timezone: 'GMT+5:30',
        location: '',
        ndaSigned: false,

        // Timeline
        internalDeadline: '',
        clientDeadline: '',
        milestones: [] as Milestone[],

        // Scope
        objectives: '',
        deliverables: '',
        outOfScope: '',
        techStack: '',
        environments: 'Prod, Staging, Dev',
        accessReqs: '',
        dependencies: '',
        riskLevel: 'LOW',

        // Team
        projectLeadId: '',
        techLeadId: '',
        commsLeadId: '',
        qaLeadId: '',
        salesOwnerId: '',

        // Weights & Tracking
        enableContributionTracking: true,
        weights: {
            acquisition: 10,
            planning: 15,
            execution: 40,
            testing: 15,
            communication: 10,
            delivery: 10
        },
        lockWeights: false,
        enableTaskLogging: true,
        effortScale: 'FIBONACCI',
        timeTrackingEnabled: false,
        approvalRequired: true,

        // Controls
        visibility: 'INTERNAL',
        canEdit: 'ADMIN',
        canAddTasks: 'PARTNER',
        canFinalize: 'ADMIN',
        autoLock: true,

        // Notes
        specialInstructions: '',
        riskNotes: '',
        clientConstraints: '',
        escalationContact: '',
        internalRemarks: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partnersRes] = await Promise.all([
                    api.get('/partners')
                ]);
                setPartners(partnersRes.data);

                if (initialData) {
                    // Populate form with existing data
                    setFormData({
                        ...formData,
                        ...initialData,
                        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
                        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                        internalDeadline: initialData.internalDeadline ? new Date(initialData.internalDeadline).toISOString().split('T')[0] : '',
                        clientDeadline: initialData.clientDeadline ? new Date(initialData.clientDeadline).toISOString().split('T')[0] : '',
                        weights: typeof initialData.weights === 'string' ? JSON.parse(initialData.weights) : (initialData.weights || formData.weights),
                        milestones: initialData.milestones?.map((m: any) => ({
                            ...m,
                            dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : ''
                        })) || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch dependencies", err);
            }
        };
        fetchData();
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await api.put(`/projects/${initialData.id}`, formData);
            } else {
                await api.post('/projects', formData);
            }
            onClose();
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addMilestone = () => {
        setFormData({
            ...formData,
            milestones: [
                ...formData.milestones,
                { name: '', dueDate: '', deliverables: '', status: 'PLANNED' }
            ]
        });
    };

    const removeMilestone = (index: number) => {
        setFormData({
            ...formData,
            milestones: formData.milestones.filter((_, i) => i !== index)
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Project Name</label>
                            <input
                                type="text" required className="input-field" placeholder="Vishal Gold"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Name</label>
                            <input
                                type="text" required className="input-field" placeholder="Savan bhai Kondhia"
                                value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Contract Value (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    type="number" required className="input-field pl-10" placeholder="24000"
                                    value={formData.totalValue} onChange={(e) => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Project Domain</label>
                            <select
                                className="input-field" value={formData.projectType}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    projectType: e.target.value,
                                    category: '' // Reset service when domain changes
                                })}
                            >
                                <option value="">Select Domain...</option>
                                {PROJECT_DOMAINS.map(domain => (
                                    <option key={domain} value={domain}>{domain}</option>
                                ))}
                            </select>
                        </div>
                        {formData.projectType && PROJECT_SERVICES[formData.projectType] && (
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Specific Service</label>
                                <select
                                    className="input-field" value={formData.category || ''}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select Service...</option>
                                    {PROJECT_SERVICES[formData.projectType].map((service: string) => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="space-y-2 text-sm">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Priority</label>
                            <div className="flex gap-2">
                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                                    <button
                                        key={p} type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${formData.priority === p ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Status</label>
                            <select
                                className="input-field" value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="PLANNED">Planned</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                );
            case 'client':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Contact Person</label>
                            <input type="text" className="input-field" value={formData.clientContact} onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Contact Email</label>
                            <input type="email" className="input-field" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Contact Number</label>
                            <input type="text" className="input-field" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">WhatsApp Number</label>
                            <input type="text" className="input-field" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Communication Channel</label>
                            <select className="input-field" value={formData.commsChannel} onChange={(e) => setFormData({ ...formData, commsChannel: e.target.value })}>
                                <option>WhatsApp</option>
                                <option>Email</option>
                                <option>Slack</option>
                                <option>Telegram</option>
                                <option>Direct Call</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Timezone</label>
                            <input type="text" className="input-field" value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-3 p-4 glass-card border-indigo-500/10">
                            <input
                                type="checkbox" className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-indigo-500"
                                checked={formData.ndaSigned} onChange={(e) => setFormData({ ...formData, ndaSigned: e.target.checked })}
                            />
                            <div>
                                <p className="text-sm font-semibold text-white">NDA Signed</p>
                                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-0.5">Required for start</p>
                            </div>
                        </div>
                    </div>
                );
            case 'timeline':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Start Date</label>
                                <input type="date" className="input-field" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Internal Deadline</label>
                                <input type="date" className="input-field" value={formData.internalDeadline} onChange={(e) => setFormData({ ...formData, internalDeadline: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Deadline</label>
                                <input type="date" className="input-field" value={formData.clientDeadline} onChange={(e) => setFormData({ ...formData, clientDeadline: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Milestones</h3>
                                <button type="button" onClick={addMilestone} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Milestone
                                </button>
                            </div>
                            {formData.milestones.map((m, idx) => (
                                <div key={idx} className="glass-card p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-neutral-500">Name</label>
                                        <input
                                            type="text" className="input-field text-xs h-9" placeholder="Scope Signoff"
                                            value={m.name} onChange={(e) => {
                                                const newM = [...formData.milestones];
                                                newM[idx].name = e.target.value;
                                                setFormData({ ...formData, milestones: newM });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-neutral-500">Due Date</label>
                                        <input
                                            type="date" className="input-field text-xs h-9"
                                            value={m.dueDate} onChange={(e) => {
                                                const newM = [...formData.milestones];
                                                newM[idx].dueDate = e.target.value;
                                                setFormData({ ...formData, milestones: newM });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-neutral-500">Deliverables</label>
                                        <input
                                            type="text" className="input-field text-xs h-9" placeholder="PDF Doc"
                                            value={m.deliverables} onChange={(e) => {
                                                const newM = [...formData.milestones];
                                                newM[idx].deliverables = e.target.value;
                                                setFormData({ ...formData, milestones: newM });
                                            }}
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeMilestone(idx)} className="h-9 px-3 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center justify-center">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'scope':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Tech Stack</label>
                                <input type="text" className="input-field" placeholder="React, Node.js, Prisma" value={formData.techStack} onChange={(e) => setFormData({ ...formData, techStack: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Environments</label>
                                <input type="text" className="input-field" value={formData.environments} onChange={(e) => setFormData({ ...formData, environments: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Project Objectives</label>
                            <textarea className="input-field min-h-[80px] py-3 text-sm" value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Deliverables List</label>
                            <textarea className="input-field min-h-[80px] py-3 text-sm" value={formData.deliverables} onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })} />
                        </div>
                    </div>
                );
            case 'team':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {[
                            { label: 'Project Lead', key: 'projectLeadId' },
                            { label: 'Technical Lead', key: 'techLeadId' },
                            { label: 'Communication Lead', key: 'commsLeadId' },
                            { label: 'QA Lead', key: 'qaLeadId' },
                            { label: 'Sales/Acquisition Owner', key: 'salesOwnerId' },
                        ].map((lead) => (
                            <div key={lead.key} className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">{lead.label}</label>
                                <select
                                    className="input-field"
                                    value={(formData as any)[lead.key]}
                                    onChange={(e) => setFormData({ ...formData, [lead.key]: e.target.value })}
                                >
                                    <option value="">Select a partner...</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>{p.user.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                );
            case 'weights':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <p className="text-xs text-neutral-400">Weights define how profit is distributed. Total must equal 100%.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {Object.entries(formData.weights).map(([cat, weight]) => (
                                <div key={cat} className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 capitalize">{cat}</label>
                                    <div className="relative">
                                        <input
                                            type="number" className="input-field pr-10"
                                            value={weight}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                weights: { ...formData.weights, [cat]: Number(e.target.value) }
                                            })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'logging':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-4 glass-card">
                                <div>
                                    <p className="text-sm font-semibold text-white">Enable Task Logging</p>
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold mt-0.5">Allow partners to log actions</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.enableTaskLogging ? 'bg-indigo-500' : 'bg-neutral-800'}`} onClick={() => setFormData({ ...formData, enableTaskLogging: !formData.enableTaskLogging })}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.enableTaskLogging ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 glass-card">
                                <div>
                                    <p className="text-sm font-semibold text-white">Task Approval Required</p>
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold mt-0.5">Admin must verify tasks</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.approvalRequired ? 'bg-indigo-500' : 'bg-neutral-800'}`} onClick={() => setFormData({ ...formData, approvalRequired: !formData.approvalRequired })}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.approvalRequired ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Effort Scale</label>
                            <select className="input-field" value={formData.effortScale} onChange={(e) => setFormData({ ...formData, effortScale: e.target.value })}>
                                <option value="FIBONACCI">Fibonacci (1, 3, 5, 8)</option>
                                <option value="LINEAR">Linear (1, 2, 3, 4, 5)</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                        </div>
                    </div>
                );
            case 'controls':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Visibility</label>
                            <select className="input-field" value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}>
                                <option value="PRIVATE">Private (Only Leads)</option>
                                <option value="INTERNAL">Internal (All Partners)</option>
                                <option value="PUBLIC">Public</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-4 glass-card">
                            <div>
                                <p className="text-sm font-semibold text-white">Auto-Lock Project</p>
                                <p className="text-[10px] text-neutral-500 uppercase font-bold mt-0.5">Prevent edits after 100%</p>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.autoLock ? 'bg-indigo-500' : 'bg-neutral-800'}`} onClick={() => setFormData({ ...formData, autoLock: !formData.autoLock })}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.autoLock ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            {initialData ? <Settings className="w-6 h-6 text-indigo-400" /> : <Plus className="w-6 h-6 text-indigo-400" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {initialData ? `Edit Project: ${formData.name}` : 'Initialize Strategic Project'}
                            </h2>
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-[0.2em] mt-0.5">Unified Configuration Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Navigation Sidebar */}
                    <div className="w-64 border-r border-neutral-800 bg-neutral-900/30 overflow-y-auto">
                        <div className="p-4 space-y-1">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${activeTab === tab.id
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-neutral-600 group-hover:text-neutral-400'}`} />
                                        {tab.label}
                                        {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-neutral-950/50">
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form id="project-form" onSubmit={handleSubmit}>
                                {renderTabContent()}
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                            <div className="flex gap-2">
                                <button type="button" onClick={onClose} className="btn-outline px-6">Discard</button>
                            </div>
                            <div className="flex gap-3">
                                {activeTab !== 'general' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const idx = TABS.findIndex(t => t.id === activeTab);
                                            setActiveTab(TABS[idx - 1].id);
                                        }}
                                        className="btn-outline flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Previous
                                    </button>
                                )}
                                {activeTab !== 'controls' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const idx = TABS.findIndex(t => t.id === activeTab);
                                            setActiveTab(TABS[idx + 1].id);
                                        }}
                                        className="btn-primary flex items-center gap-2 px-8"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        form="project-form"
                                        disabled={loading}
                                        className="btn-primary flex items-center gap-2 px-10 relative overflow-hidden group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>{initialData ? 'Update Project' : 'Deploy Project'}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
