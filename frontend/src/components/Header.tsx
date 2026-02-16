"use client";

import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects, tasks..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-neutral-400 hover:text-neutral-100 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-neutral-950" />
                </button>

                <div className="h-8 w-px bg-neutral-800" />

                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Admin User</p>
                        <p className="text-xs text-neutral-500">Administrator</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center group-hover:border-indigo-500 transition-all overflow-hidden">
                        <User className="w-5 h-5 text-neutral-400" />
                    </div>
                </div>
            </div>
        </header>
    );
}
