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
    Command
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
    };

    const NavGroup = ({ title, items }: { title?: string, items: any[] }) => (
        <div className="mb-6">
            {title && (
                <h4 className="px-4 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
                    {title}
                </h4>
            )}
            <div className="space-y-0.5">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2.5 px-4 py-1.5 text-sm transition-all border-l-2",
                                isActive
                                    ? "border-indigo-500 text-neutral-100 bg-neutral-900"
                                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4",
                                isActive ? "text-indigo-400" : "text-neutral-500"
                            )} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );

    return (
        <aside className="w-60 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full flex-shrink-0">
            {/* Logo Area */}
            <div className="p-4 h-16 flex items-center border-b border-neutral-900">
                <div className="flex items-center gap-2 text-neutral-100">
                    <div className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center text-neutral-950">
                        <Command className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">ProjectBase</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
                <NavGroup
                    items={[
                        { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' }
                    ]}
                />

                <NavGroup
                    title="Management"
                    items={[
                        { name: 'Projects', icon: Briefcase, href: '/dashboard/projects' },
                        { name: 'Tasks', icon: Briefcase, href: '/dashboard/tasks' }, // Assumed exist/will exist
                        { name: 'Network', icon: Users, href: '/dashboard/partners' },
                    ]}
                />

                <NavGroup
                    title="Intelligence"
                    items={[
                        { name: 'Financials', icon: PieChart, href: '/dashboard/financials' },
                        { name: 'Audit Logs', icon: ShieldAlert, href: '/dashboard/logs' },
                    ]}
                />

                <NavGroup
                    title="Legal"
                    items={[
                        { name: 'Documents', icon: FileText, href: '/dashboard/documents' },
                        { name: 'Agreements', icon: ShieldCheck, href: '/dashboard/agreements' },
                    ]}
                />
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-neutral-900">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2 py-1.5 w-full text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
                <Link
                    href="/dashboard/settings"
                    className="mt-3 flex items-center gap-3 px-2 py-2 rounded-md hover:bg-neutral-900 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400 border border-neutral-700">
                        ME
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-medium text-neutral-200">My Profile</p>
                        <p className="text-[10px] text-neutral-500">Settings</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
