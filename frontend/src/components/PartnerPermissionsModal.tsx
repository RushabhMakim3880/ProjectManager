'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Shield,
    Check,
    AlertCircle,
    Vote,
    DollarSign,
    Layout,
    Briefcase,
    MessageSquare,
    Eye,
    Edit3,
    FileCheck
} from 'lucide-react';
import api from '@/lib/api';

interface PartnerPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    partner: any;
    onSuccess: () => void;
}

export default function PartnerPermissionsModal({ isOpen, onClose, partner, onSuccess }: PartnerPermissionsModalProps) {
    const [permissions, setPermissions] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (partner) {
            setPermissions({
                hasVotingRights: partner.hasVotingRights,
                canApprovePayouts: partner.canApprovePayouts,
                canFinalizeContribution: partner.canFinalizeContribution,
                canEditFinancials: partner.canEditFinancials,
                canCreateProjects: partner.canCreateProjects,
                hasRevenueVisibility: partner.hasRevenueVisibility,
                canLeadProjects: partner.canLeadProjects,
                canHandleClientComms: partner.canHandleClientComms,
                canApproveScope: partner.canApproveScope,
                canLogTasks: partner.canLogTasks,
                canEditOwnLogs: partner.canEditOwnLogs,
                canEditOthersLogs: partner.canEditOthersLogs,
                canViewContributionBreakdown: partner.canViewContributionBreakdown,
            });
        }
    }, [partner]);

    const handleToggle = (key: string) => {
        setPermissions((prev: any) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.patch(`/partners/${partner.id}`, permissions);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !partner) return null;

    const permissionGroups = [
        {
            title: "Administrative & Governance",
            icon: <Shield className="w-4 h-4" />,
            items: [
                { key: "hasVotingRights", label: "Voting Rights", icon: <Vote className="w-4 h-4" /> },
                { key: "canCreateProjects", label: "Create New Projects", icon: <Briefcase className="w-4 h-4" /> },
                { key: "canLeadProjects", label: "Lead Projects", icon: <Layout className="w-4 h-4" /> },
            ]
        },
        {
            title: "Financial & Payouts",
            icon: <DollarSign className="w-4 h-4" />,
            items: [
                { key: "canEditFinancials", label: "Edit Project Financials", icon: <DollarSign className="w-4 h-4" /> },
                { key: "canApprovePayouts", label: "Approve Payouts", icon: <FileCheck className="w-4 h-4" /> },
                { key: "hasRevenueVisibility", label: "Revenue Visibility", icon: <Eye className="w-4 h-4" /> },
            ]
        },
        {
            title: "Task & Contribution Management",
            icon: <Edit3 className="w-4 h-4" />,
            items: [
                { key: "canLogTasks", label: "Add/Log Tasks", icon: <Check className="w-4 h-4" /> },
                { key: "canEditOwnLogs", label: "Edit Own Task Logs", icon: <Edit3 className="w-4 h-4" /> },
                { key: "canEditOthersLogs", label: "Edit Others' Logs", icon: <AlertCircle className="w-4 h-4" /> },
                { key: "canFinalizeContribution", label: "Finalize Contribution", icon: <Check className="w-4 h-4" /> },
                { key: "canViewContributionBreakdown", label: "View Detailed Breakdown", icon: <Eye className="w-4 h-4" /> },
            ]
        },
        {
            title: "Client & Scope",
            icon: <MessageSquare className="w-4 h-4" />,
            items: [
                { key: "canHandleClientComms", label: "Client Communications", icon: <MessageSquare className="w-4 h-4" /> },
                { key: "canApproveScope", label: "Approve Project Scope", icon: <Check className="w-4 h-4" /> },
            ]
        }
    ];


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl glass-card overflow-hidden shadow-2xl border-white/10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Manage Permissions</h2>
                            <p className="text-sm text-neutral-500">{partner.user?.name} ({partner.user?.role})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {permissionGroups.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-800/50 pb-2">
                                    {group.icon}
                                    {group.title}
                                </div>
                                <div className="space-y-3">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.key}
                                            onClick={() => handleToggle(item.key)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${permissions[item.key] ? 'bg-indigo-500/10 text-indigo-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className={`text-sm font-medium ${permissions[item.key] ? 'text-white' : 'text-neutral-500'}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div className={`w-10 h-6 rounded-full transition-all relative ${permissions[item.key] ? 'bg-indigo-500' : 'bg-neutral-800'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${permissions[item.key] ? 'left-5' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl font-bold text-neutral-400 hover:bg-neutral-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-3 px-8 py-2.5 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
