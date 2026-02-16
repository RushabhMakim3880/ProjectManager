"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    TrendingUp,
    MoreHorizontal,
    Circle,
    Star,
    Trash2,
    UserCog,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import InvitePartnerModal from '@/components/InvitePartnerModal';

export default function PartnersPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/partners');
            setPartners(res.data);
        } catch (err) {
            console.error("Failed to fetch partners", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleInviteSuccess = () => {
        fetchPartners();
    };

    const handleToggleEquity = async (partnerId: string, currentStatus: boolean) => {
        setActionLoading(`equity-${partnerId}`);
        try {
            await api.patch(`/partners/${partnerId}`, { isEquity: !currentStatus });
            await fetchPartners();
            setOpenMenuId(null);
        } catch (err) {
            console.error("Failed to toggle equity", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangeRole = async (partnerId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'PARTNER' : 'ADMIN';
        setActionLoading(`role-${partnerId}`);
        try {
            await api.patch(`/partners/${partnerId}`, { role: newRole });
            await fetchPartners();
            setOpenMenuId(null);
        } catch (err) {
            console.error("Failed to change role", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePartner = async (partnerId: string) => {
        if (!confirm("Are you sure you want to remove this partner? This action cannot be undone.")) return;

        setActionLoading(`delete-${partnerId}`);
        try {
            await api.delete(`/partners/${partnerId}`);
            await fetchPartners();
            setOpenMenuId(null);
        } catch (err) {
            console.error("Failed to delete partner", err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Partner Network</h1>
                    <p className="text-neutral-500 text-sm">Manage access and track performance of all project collaborators</p>
                </div>
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Invite Partner
                </button>
            </div>

            <InvitePartnerModal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onSuccess={handleInviteSuccess}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Total Network</p>
                            <p className="text-2xl font-bold text-white">{partners.length} Partners</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Equity Partners</p>
                            <p className="text-2xl font-bold text-white">{partners.filter(p => p.isEquity).length}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Top Earner</p>
                            <p className="text-2xl font-bold text-white">
                                {partners.length > 0 ? (partners.sort((a, b) => b.totalEarnings - a.totalEarnings)[0]?.user?.name?.split(' ')[0] + '.') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card min-h-[400px]">
                <div className="overflow-x-auto pb-32">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-800 bg-neutral-900/50">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Partner Details</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Equity</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Total Earnings</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {partners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-neutral-800/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-400">
                                                    {partner.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{partner.user?.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                                                        <Mail className="w-3 h-3" />
                                                        {partner.user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Shield className={`w-4 h-4 ${partner.user?.role === 'ADMIN' ? 'text-indigo-400' : 'text-neutral-500'}`} />
                                                <span className={partner.user?.role === 'ADMIN' ? 'text-indigo-100' : 'text-neutral-400'}>
                                                    {partner.user?.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Circle className={`w-2 h-2 fill-current ${partner.isEquity ? 'text-emerald-500' : 'text-neutral-700'}`} />
                                                <span className="text-neutral-300">{partner.isEquity ? 'Equity Partner' : 'Standard'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-bold text-white">₹{partner.totalEarnings?.toLocaleString() || '0'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === partner.id ? null : partner.id)}
                                                className="p-2 text-neutral-500 hover:text-white transition-colors hover:bg-neutral-800 rounded-lg"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {openMenuId === partner.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                                                        <button
                                                            onClick={() => handleToggleEquity(partner.id, partner.isEquity)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-3 transition-colors"
                                                        >
                                                            {actionLoading === `equity-${partner.id}` ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Star className={`w-4 h-4 ${partner.isEquity ? 'text-amber-500 fill-current' : 'text-neutral-500'}`} />
                                                            )}
                                                            {partner.isEquity ? 'Revoke Equity' : 'Grant Equity'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleChangeRole(partner.id, partner.user?.role)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-3 transition-colors"
                                                        >
                                                            {actionLoading === `role-${partner.id}` ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <UserCog className="w-4 h-4 text-indigo-400" />
                                                            )}
                                                            {partner.user?.role === 'ADMIN' ? 'Make Partner' : 'Make Admin'}
                                                        </button>
                                                        <div className="h-px bg-neutral-800 my-1" />
                                                        <button
                                                            onClick={() => handleDeletePartner(partner.id)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                                                        >
                                                            {actionLoading === `delete-${partner.id}` ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                            Remove Partner
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
