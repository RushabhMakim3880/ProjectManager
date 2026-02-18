'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock } from 'lucide-react';
import api from '@/lib/api';

interface CapitalInjection {
    id: string;
    amount: number;
    date: string;
    notes?: string;
    equityDelta: number;
}

interface CapitalHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId: string;
    partnerName: string;
    onDeleteSuccess: () => void;
}

export default function CapitalHistoryModal({ isOpen, onClose, partnerId, partnerName, onDeleteSuccess }: CapitalHistoryModalProps) {
    const [history, setHistory] = useState<CapitalInjection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && partnerId) {
            fetchHistory();
        }
    }, [isOpen, partnerId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/finance/capital-injections/${partnerId}`);
            setHistory(res.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, amount: number) => {
        if (!confirm(`Are you sure you want to delete the ₹${amount.toLocaleString()} injection? \n\nThis will RECALCULATE equity for ALL partners immediately.`)) {
            return;
        }

        setDeletingId(id);
        try {
            await api.delete(`/finance/capital-injections/${id}`);
            await fetchHistory();
            onDeleteSuccess(); // Trigger parent refresh
        } catch (error) {
            console.error('Failed to delete injection:', error);
            alert('Failed to delete transaction');
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        Capital History: <span className="text-indigo-400">{partnerName}</span>
                    </h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-8 text-neutral-500 animate-pulse">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">No capital injections found.</div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">₹{item.amount.toLocaleString()}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${item.equityDelta >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {item.equityDelta > 0 ? '+' : ''}{item.equityDelta.toFixed(2)}% Equity
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.date).toLocaleDateString()}
                                            {item.notes && <span className="text-neutral-400 border-l border-neutral-800 pl-2">{item.notes}</span>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item.id, item.amount)}
                                        disabled={deletingId === item.id}
                                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                                        title="Delete & Recalculate Equity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
