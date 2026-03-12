"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import EnquiryList from '@/components/EnquiryList';
import NewEnquiryModal from '@/components/NewEnquiryModal';

export default function EnquiriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        // Incrementing refreshKey will force EnquiryList to remount and fetch fresh data
        setRefreshKey(prev => prev + 1);
        setIsModalOpen(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-theme(spacing.16))]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Enquiries
                    </h1>
                    <p className="text-neutral-400">
                        Manage incoming enquiries and client intakes.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Enquiry
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                <EnquiryList key={refreshKey} />
            </div>

            {isModalOpen && (
                <NewEnquiryModal 
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
