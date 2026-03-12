import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#0a0f16] text-neutral-100 overflow-hidden font-sans relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 z-10 relative">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
