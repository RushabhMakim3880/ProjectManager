'use client';

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Send, User } from 'lucide-react';
import api from '@/lib/api';

interface CapitalInjectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentUserId: string;
    partners: Array<{ id: string, name: string }>;
}

export default function CapitalInjectionModal({ isOpen, onClose, onSuccess, currentUserId, partners }: CapitalInjectionModalProps) {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedPartnerId, setSelectedPartnerId] = useState(currentUserId);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (currentUserId) {
                setSelectedPartnerId(currentUserId);
            } else if (partners.length > 0) {
                setSelectedPartnerId(partners[0].id);
            }
        }
    }, [isOpen, currentUserId, partners]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/finance/capital-injection', {
                partnerId: selectedPartnerId,
                amount: parseFloat(amount),
                notes
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to inject capital:', error);
            alert('Failed to process capital injection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Inject Capital
                    </h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-400">Select Partner</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <select
                                value={selectedPartnerId}
                                onChange={(e) => setSelectedPartnerId(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                            >
                                {partners.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-400">Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-400">Notes / Reference</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                            placeholder="Bank Ref, Check No., etc."
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !selectedPartnerId || !amount}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Send className="w-4 h-4" /> Confirm Injection
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
