"use client";

import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Shield,
    Smartphone,
    Save,
    ChevronRight,
    Moon,
    Briefcase,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [systemSettings, setSystemSettings] = useState<any>({
        companyName: '',
        companyAddress: '',
        companyEmail: '',
        companyPhone: '',
        companyWebsite: '',
        companyTaxId: '',
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankIfsc: '',
        companyLogo: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userRes, systemRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/system/settings')
            ]);
            setUser(userRes.data);
            setSystemSettings(systemRes.data || {});
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/system/settings', systemSettings);
            alert('Settings updated successfully!');
        } catch (err) {
            console.error("Failed to update settings", err);
            alert('Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Preferences & Security</h1>
                <p className="text-neutral-500 text-sm">Configure your personal experience and system-wide parameters</p>
            </div>

            <div className="space-y-6">
                <section className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/40">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" />
                            Personal Profile
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {loading ? (
                            <div className="py-4 text-neutral-500">Loading profile...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Display Name</label>
                                    <input type="text" className="input-field" defaultValue={user?.name || ""} disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Email Address</label>
                                    <input type="email" className="input-field" defaultValue={user?.email || ""} disabled />
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                            {isAdmin ? "Profile editing is centralized for consistency." : "Profile editing is managed by system administrator."}
                        </p>
                    </div>
                </section>

                {/* Company Profile Section */}
                <section className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/40">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-emerald-400" />
                            Company Configuration
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Company Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={systemSettings.companyName}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Logo URL</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={systemSettings.companyLogo || ''}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, companyLogo: e.target.value })}
                                    placeholder="https://..."
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-neutral-400">Company Address</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={systemSettings.companyAddress || ''}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, companyAddress: e.target.value })}
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Company Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={systemSettings.companyEmail || ''}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, companyEmail: e.target.value })}
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Tax ID / PAN</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={systemSettings.companyTaxId || ''}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, companyTaxId: e.target.value })}
                                    disabled={!isAdmin}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-800">
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Bank Details (For Payouts/Agreements)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Bank Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={systemSettings.bankName || ''}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, bankName: e.target.value })}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Account Number</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={systemSettings.bankAccountNumber || ''}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, bankAccountNumber: e.target.value })}
                                        disabled={!isAdmin}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/40">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-400" />
                            Account Security
                        </h2>
                    </div>
                    <div className="p-6 divide-y divide-neutral-800">
                        <div className={`py-4 flex items-center justify-between group ${isAdmin ? 'cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded-xl transition-all' : 'cursor-not-allowed opacity-50'}`}>
                            <div>
                                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {isAdmin ? "Standard TOTP/Email MFA available" : "Contact admin to enable secure MFA"}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-700" />
                        </div>
                        <div className={`py-4 flex items-center justify-between group ${isAdmin ? 'cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded-xl transition-all' : 'cursor-not-allowed opacity-50'}`}>
                            <div>
                                <p className="text-sm font-medium text-white">Change Password</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {isAdmin ? "Manage your secure administrative password" : "Secure password updates via admin request"}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-700" />
                        </div>
                    </div>
                </section>

                <section className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/40">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-sky-400" />
                            Interface Customization
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-neutral-800">
                                    <Moon className="w-4 h-4 text-neutral-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Luxury Dark Theme</p>
                                    <p className="text-xs text-neutral-500">Premium neutral-950 aesthetic (Active)</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1">
                                <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-neutral-800">
                                    <Bell className="w-4 h-4 text-neutral-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Email Notifications</p>
                                    <p className="text-xs text-neutral-500">Project alerts and payout summaries</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-neutral-800 rounded-full relative p-1">
                                <div className="absolute left-1 w-4 h-4 bg-neutral-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-3 pt-4">
                    <button className="btn-outline" onClick={() => fetchData()}>Reset to Defaults</button>
                    {isAdmin && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex items-center gap-2 px-8 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all text-white font-bold"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
