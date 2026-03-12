"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Settings,
    FileText,
    PieChart,
    LogOut,
    ShieldAlert,
    ShieldCheck,
    Inbox,
    Activity,
    TrendingUp,
    Radar,
    Mail
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
    { name: 'Lead Hunter', icon: Radar, href: '/dashboard/leads' },
    { name: 'Outreach', icon: Mail, href: '/dashboard/leads/saved' },
    { name: 'Enquiries', icon: Inbox, href: '/dashboard/enquiries' },
    { name: 'Projects', icon: Briefcase, href: '/dashboard/projects' },
    { name: 'Partners', icon: Users, href: '/dashboard/partners' },
    { name: 'Operations', icon: Activity, href: '/dashboard/operations' },
    { name: 'Financials', icon: PieChart, href: '/dashboard/financials' },
    { name: 'Documents', icon: FileText, href: '/dashboard/documents' },
    { name: 'Agreements', icon: ShieldCheck, href: '/dashboard/agreements' },
    { name: 'Audit Logs', icon: ShieldAlert, href: '/dashboard/logs', adminOnly: true },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-[#0a0f16]/40 backdrop-blur-2xl border-r border-white/5 flex flex-col h-full relative z-20 shadow-2xl">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/10">
                    P
                </div>
                <span className="font-bold text-xl tracking-tight text-white drop-shadow-sm">ProjectBase</span>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group border",
                                isActive
                                    ? "bg-blue-500/10 text-blue-400 font-medium border-blue-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
                                    : "border-transparent text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4 transition-colors drop-shadow-sm",
                                isActive ? "text-blue-400" : "text-neutral-500 group-hover:text-neutral-300"
                            )} />
                            <span className="text-sm drop-shadow-sm">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 bg-gradient-to-t from-[#0a0f16]/80 to-transparent">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-4 h-4 text-neutral-500 group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
