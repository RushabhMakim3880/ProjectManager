"use client";

import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Shield,
    Smartphone,
    Save,
    ChevronRight,
    Moon
} from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Profile editing is managed by system administrator.</p>
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
                        <div className="py-4 flex items-center justify-between group cursor-not-allowed opacity-50">
                            <div>
                                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                                <p className="text-xs text-neutral-500 mt-1">Contact admin to enable secure MFA</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-700" />
                        </div>
                        <div className="py-4 flex items-center justify-between group cursor-not-allowed opacity-50">
                            <div>
                                <p className="text-sm font-medium text-white">Change Password</p>
                                <p className="text-xs text-neutral-500 mt-1">Secure password updates coming soon</p>
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
                    <button className="btn-outline">Reset to Defaults</button>
                    <button className="btn-primary flex items-center gap-2 px-8 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
