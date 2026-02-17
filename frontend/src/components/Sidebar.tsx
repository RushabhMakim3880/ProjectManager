"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Settings,
    FileText,
    PieChart,
    LogOut,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Projects', icon: Briefcase, href: '/dashboard/projects' },
    { name: 'Partners', icon: Users, href: '/dashboard/partners' },
    { name: 'Financials', icon: PieChart, href: '/dashboard/financials' },
    { name: 'Documents', icon: FileText, href: '/dashboard/documents' },
    { name: 'Agreements', icon: ShieldCheck, href: '/dashboard/agreements' },
    { name: 'Audit Logs', icon: ShieldAlert, href: '/dashboard/logs', adminOnly: true },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    P
                </div>
                <span className="font-bold text-xl tracking-tight">ProjectBase</span>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                isActive
                                    ? "bg-indigo-600/10 text-indigo-400 font-medium"
                                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-300"
                            )} />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-neutral-800">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all group">
                    <LogOut className="w-5 h-5 text-neutral-500 group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
