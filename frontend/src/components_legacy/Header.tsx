"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
    const pathname = usePathname() || '';
    const segments = pathname.split('/').filter(Boolean);

    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;

        // Capitalize and format segment
        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        return { title, href, isLast };
    });

    return (
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/50 backdrop-blur-sm z-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                    Dashboard
                </Link>
                {segments.length > 0 && segments[0] !== 'dashboard' && (
                    <>
                        <span className="text-neutral-700">/</span>
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={crumb.href} className="flex items-center gap-2">
                                {idx > 0 && <span className="text-neutral-700">/</span>}
                                {crumb.isLast ? (
                                    <span className="text-neutral-200 font-medium">{crumb.title}</span>
                                ) : (
                                    <Link href={crumb.href} className="text-neutral-500 hover:text-neutral-300 transition-colors">
                                        {crumb.title}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </>
                )}
                {segments.length === 1 && segments[0] === 'dashboard' && (
                    <>
                        <span className="text-neutral-700">/</span>
                        <span className="text-neutral-200 font-medium">Overview</span>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 w-64 transition-all"
                    />
                </div>

                <button className="relative p-2 text-neutral-400 hover:text-neutral-200 transition-colors rounded-md hover:bg-neutral-800/50">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-neutral-950"></span>
                </button>

                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                    <User className="w-4 h-4" />
                </div>
            </div>
        </header>
    );
}
