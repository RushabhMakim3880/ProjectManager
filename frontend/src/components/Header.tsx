"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const roleLabelMap: Record<string, string> = {
        'ADMIN': 'Administrator',
        'CLIENT': 'Client Portal',
        'PARTNER': 'Partner / Freelancer'
    };
    return (
        <header className="h-16 border-b border-white/5 bg-[#0a0f16]/60 backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm relative">
            <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects, tasks..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-light text-neutral-200 placeholder:text-neutral-500 shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 mr-4">
                    <Link href="/dashboard/enquiries?new=true" className="btn-outline flex items-center gap-2 py-1.5 px-3 mb-0 text-xs text-neutral-300 border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 backdrop-blur-md transition-all shadow-sm rounded-lg">
                        <Plus className="w-3.5 h-3.5" /> New Lead
                    </Link>
                    <Link href="/dashboard/projects?new=true" className="btn-primary flex items-center gap-2 py-1.5 px-3 mb-0 text-xs shadow-[0_0_15px_rgba(37,106,244,0.3)] hover:shadow-[0_0_20px_rgba(37,106,244,0.5)] transition-all bg-blue-600 hover:bg-blue-500 border-0 rounded-lg text-white font-medium">
                        <Plus className="w-3.5 h-3.5" /> New Project
                    </Link>
                </div>

                <button className="p-2 text-neutral-400 hover:text-white transition-colors relative bg-white/5 rounded-full hover:bg-white/10 border border-white/5">
                    <Bell className="w-4 h-4 drop-shadow-sm" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0f16] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                </button>

                <div className="h-8 w-px bg-white/10" />

                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors drop-shadow-sm">
                            {user?.name || 'Loading...'}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {user?.role ? (roleLabelMap[user.role] || user.role) : 'Verifying...'}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-all overflow-hidden relative shadow-inner">
                        <User className="w-4 h-4 text-blue-400 drop-shadow-sm" />
                    </div>
                </div>
            </div>
        </header>
    );
}
