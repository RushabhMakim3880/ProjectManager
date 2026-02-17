'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    FileText,
    TrendingUp,
    Filter,
    ArrowRight,
    Receipt
} from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
    id: string;
    amount: number;
    date: string;
    type: 'INCOME' | 'EXPENSE';
    category?: string;
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
        category: 'GENERAL',
        otherCategory: '',
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
                category: newTransaction.category === 'OTHER' ? newTransaction.otherCategory : newTransaction.category,
                projectId,
                amount: parseFloat(newTransaction.amount)
            });
            setShowAddModal(false);
            setNewTransaction({
                amount: '',
                type: 'INCOME',
                category: 'GENERAL',
                otherCategory: '',
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
        <div className="space-y-8">
            {/* Header / Summary Matrix */}
            {/* Header / Summary Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-neutral-400">Capital Inflow</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-1">Total Realized Revenue</p>
                    <h3 className="text-2xl font-bold text-white">₹{totalIncome.toLocaleString()}</h3>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-neutral-400">Asset Burn</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-1">Operational Expenses</p>
                    <h3 className="text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</h3>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20 group hover:border-indigo-500/40 transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Wallet className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                            <Tag className="w-5 h-5 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest italic">Net Reservoir</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 leading-none">Available Pool Balance</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter">₹{balance.toLocaleString()}</h3>
                </motion.div>
            </div>

            {/* Actions & Filters */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-indigo-500" />
                        Project Ledger
                    </h2>
                    <div className="h-6 w-[1.5px] bg-neutral-800" />
                    <button className="flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
                        <Filter className="w-3.5 h-3.5" /> All Transactions
                    </button>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                >
                    <Plus className="w-4 h-4" />
                    Record Movement
                </button>
            </div>

            {/* Transactions Audit Trail */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card overflow-hidden bg-neutral-900/20 border-neutral-800/50"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-900/40">
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Timeline</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Narrative & Attribution</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Gateway</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] text-right">Value Asset</th>
                                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {transactions.length > 0 ? transactions.map((t, idx) => (
                                <motion.tr
                                    key={t.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.03) }}
                                    className="hover:bg-indigo-500/[0.02] transition-colors group"
                                >
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white tracking-tight">
                                                {new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-[9px] font-medium text-neutral-600 uppercase">
                                                {new Date(t.date).getFullYear()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-bold text-neutral-200 tracking-tight leading-none">{t.description || 'System Entry'}</p>
                                                {t.category && t.category !== 'GENERAL' && (
                                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 uppercase tracking-widest border border-indigo-500/20 italic">
                                                        {t.category.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            {t.transactionId && (
                                                <div className="flex items-center gap-1.5">
                                                    <FileText className="w-3 h-3 text-neutral-700" />
                                                    <span className="text-[9px] text-neutral-600 font-mono tracking-tighter uppercase">Audit Ref: {t.transactionId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 group/method">
                                            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-500 group-hover/method:text-indigo-400 group-hover/method:border-indigo-500/30 transition-all">
                                                {getMethodIcon(t.method)}
                                            </div>
                                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest group-hover/method:text-neutral-300 transition-colors">{t.method}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-tighter italic">Movement Recorded</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => handleDeleteTransaction(t.id)}
                                            className="p-2.5 text-neutral-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Receipt className="w-12 h-12 text-neutral-800" />
                                            <p className="text-sm text-neutral-600 font-bold uppercase tracking-[0.2em] italic">No transaction records detected in current scope</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add Transaction Modal & Animation */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg glass-card p-10 shadow-2xl border-indigo-500/20 bg-neutral-900/60 overflow-hidden"
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <Receipt className="w-64 h-64" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Log Financial Event</h2>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-8">Asset Liquidity & Operational Tracking</p>

                                <form onSubmit={handleAddTransaction} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Event Type</label>
                                            <select
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-indigo-400 font-black focus:border-indigo-500 outline-none transition-all appearance-none uppercase"
                                                value={newTransaction.type}
                                                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                                            >
                                                <option value="INCOME">Income / Credit</option>
                                                <option value="EXPENSE">Expense / Debit</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Capital Gateway</label>
                                            <select
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white font-bold focus:border-indigo-500 outline-none transition-all appearance-none"
                                                value={newTransaction.method}
                                                onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
                                            >
                                                <option value="UPI">Digital (UPI)</option>
                                                <option value="CARD">Debit/Credit Card</option>
                                                <option value="BANK">Bank SWIFT/NEFT</option>
                                                <option value="CASH">Physical Assets (Cash)</option>
                                                <option value="OTHER">Custom Channel</option>
                                            </select>
                                        </div>
                                    </div>

                                    {newTransaction.type === 'EXPENSE' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 text-amber-500/80 italic">Allocation Classification</label>
                                                <select
                                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-amber-500 font-black focus:border-amber-500/50 outline-none transition-all appearance-none uppercase"
                                                    value={newTransaction.category}
                                                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                                >
                                                    <option value="GENERAL">Operational Expense</option>
                                                    <option value="BUSINESS_GROWTH">Strategic Re-investment</option>
                                                    <option value="RELIGIOUS">Spiritual Contribution (FAITH)</option>
                                                    <option value="CHARITY">Philanthropy / Social Impact</option>
                                                    <option value="OTHER">Specific Classification</option>
                                                </select>
                                                <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest ml-1">Faith and Growth allocations are tracked for buffer utilization</p>
                                            </div>

                                            {newTransaction.category === 'OTHER' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-2"
                                                >
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Custom Classification</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all font-bold placeholder:text-neutral-800"
                                                        placeholder="Name the classification..."
                                                        value={newTransaction.otherCategory}
                                                        onChange={(e) => setNewTransaction({ ...newTransaction, otherCategory: e.target.value })}
                                                    />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 leading-none">Capital Volume (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-lg font-black text-white focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-800"
                                                placeholder="0.00"
                                                value={newTransaction.amount}
                                                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Event Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-neutral-300 focus:border-indigo-500 outline-none transition-all font-bold"
                                                value={newTransaction.date}
                                                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Descriptive Context</label>
                                        <input
                                            type="text"
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all font-bold placeholder:text-neutral-800"
                                            placeholder="Purpose of this financial movement..."
                                            value={newTransaction.description}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Audit Identification (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-5 py-3 text-xs text-neutral-400 font-mono tracking-tighter focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-800 uppercase"
                                            placeholder="Transaction ID / Ref Number"
                                            value={newTransaction.transactionId}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, transactionId: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 px-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
                                        >
                                            Abort Log
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_25px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group"
                                        >
                                            Record Event <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
