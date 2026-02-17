'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Smartphone,
    Banknote,
    Wallet,
    Calendar,
    Tag,
    FileText
} from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
    id: string;
    amount: number;
    date: string;
    type: 'INCOME' | 'EXPENSE';
    method: string;
    transactionId?: string;
    description?: string;
}

interface ProjectLedgerProps {
    projectId: string;
    onUpdate?: () => void;
}

export default function ProjectLedger({ projectId, onUpdate }: ProjectLedgerProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'INCOME',
        method: 'UPI',
        transactionId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchTransactions = async () => {
        try {
            const res = await api.get(`/projects/${projectId}/transactions`);
            setTransactions(res.data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [projectId]);

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/projects/transactions', {
                ...newTransaction,
                projectId,
                amount: parseFloat(newTransaction.amount)
            });
            setShowAddModal(false);
            setNewTransaction({
                amount: '',
                type: 'INCOME',
                method: 'UPI',
                transactionId: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchTransactions();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to add transaction:', error);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await api.delete(`/projects/transactions/${id}`);
            fetchTransactions();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }
    };

    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    const getMethodIcon = (method: string) => {
        switch (method.toUpperCase()) {
            case 'UPI': return <Smartphone className="w-4 h-4" />;
            case 'CARD': return <CreditCard className="w-4 h-4" />;
            case 'BANK': return <Banknote className="w-4 h-4" />;
            default: return <Wallet className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/20">
                    <p className="text-sm text-neutral-400 mb-1 font-medium">Total Income</p>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-400">₹{totalIncome.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 bg-rose-500/5 border-rose-500/20">
                    <p className="text-sm text-neutral-400 mb-1 font-medium">Total Expenses</p>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-500/20 rounded-lg">
                            <ArrowDownLeft className="w-5 h-5 text-rose-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-rose-400">₹{totalExpenses.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 bg-blue-500/5 border-blue-500/20">
                    <p className="text-sm text-neutral-400 mb-1 font-medium">Net Balance</p>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Tag className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-400">₹{balance.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Record Transaction
                </button>
            </div>

            {/* Transactions List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-900/50">
                                <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Description</th>
                                <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Method</th>
                                <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Amount</th>
                                <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {transactions.length > 0 ? transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-neutral-800/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                                            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                                            {new Date(t.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-medium text-white">{t.description || 'No description'}</p>
                                            {t.transactionId && (
                                                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Ref: {t.transactionId}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 w-fit text-xs border border-neutral-700">
                                            {getMethodIcon(t.method)}
                                            {t.method}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {t.type === 'INCOME' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDeleteTransaction(t.id)}
                                            className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-neutral-500 italic">
                                        No transactions recorded for this project yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative w-full max-w-md glass-card p-6 shadow-2xl border-white/10">
                        <h2 className="text-xl font-bold text-white mb-6">Record New Transaction</h2>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-400 uppercase">Type</label>
                                    <select
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                                        value={newTransaction.type}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                                    >
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-neutral-400 uppercase">Method</label>
                                    <select
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                                        value={newTransaction.method}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="CARD">Card Payment</option>
                                        <option value="BANK">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="e.g. 5000"
                                    value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                                    value={newTransaction.date}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase">Description</label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="e.g. Milestone 1 Payment"
                                    value={newTransaction.description}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase">Transaction ID (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="Ref number if any"
                                    value={newTransaction.transactionId}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, transactionId: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl font-bold hover:bg-neutral-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-all font-premium"
                                >
                                    Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
