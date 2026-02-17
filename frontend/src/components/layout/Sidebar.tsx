"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Wallet,
    FileText,
    Settings,
    LogOut,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Partners', href: '/dashboard/partners', icon: Users },
    { name: 'Financials', href: '/dashboard/financials', icon: Wallet },
    { name: 'Agreements', href: '/dashboard/agreements', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-border">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
                    <Shield className="w-5 h-5" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">ProTrack</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                                isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
