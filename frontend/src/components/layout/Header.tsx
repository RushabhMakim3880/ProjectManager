"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
    const pathname = usePathname() || '';
    const segments = pathname.split('/').filter(Boolean).slice(1); // Remove 'dashboard'

    return (
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Dashboard</span>
                {segments.map((segment) => (
                    <React.Fragment key={segment}>
                        <span>/</span>
                        <span className="capitalize">{segment.replace('-', ' ')}</span>
                    </React.Fragment>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                </Button>
            </div>
        </header>
    );
}
