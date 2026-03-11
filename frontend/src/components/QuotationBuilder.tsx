"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Calculator, Percent, DollarSign, FileText } from 'lucide-react';
import axios from 'axios';

interface LineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface QuotationBuilderProps {
    enquiryId: string;
    initialServices?: string[];
    onClose: () => void;
    onSave: () => void;
}

export default function QuotationBuilder({ enquiryId, initialServices = [], onClose, onSave }: QuotationBuilderProps) {
    const [lineItems, setLineItems] = useState<LineItem[]>(
        initialServices.length > 0
            ? initialServices.map(s => ({ description: s, quantity: 1, unitPrice: 0, amount: 0 }))
            : [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    );
    const [taxRate, setTaxRate] = useState(0); // Percentage
    const [discount, setDiscount] = useState(0); // Fixed amount
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(`Quotation for ${enquiryId}`);
    const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...lineItems];
        const item = { ...newItems[index] };

        if (field === 'quantity' || field === 'unitPrice') {
            const numVal = typeof value === 'string' ? parseFloat(value) || 0 : value;
            (item[field] as number) = numVal;
            item.amount = item.quantity * item.unitPrice;
        } else {
            (item[field] as any) = value;
        }

        newItems[index] = item;
        setLineItems(newItems);
    };

    const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0);
    const calculateTax = () => (calculateSubtotal() * taxRate) / 100;
    const calculateTotal = () => calculateSubtotal() + calculateTax() - discount;

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const subtotal = calculateSubtotal();
            const tax = calculateTax();
            const total = calculateTotal();

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiryId}/quotations`, {
                title,
                items: lineItems,
                subtotal,
                tax,
                discount,
                total,
                validUntil: new Date(validUntil),
                currency: 'USD'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onSave();
            onClose();
        } catch (error: any) {
            console.error("Failed to save quotation", error);
            alert(error.response?.data?.error || "Failed to save quotation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Quotation Builder</h3>
                            <p className="text-sm text-neutral-500">Draft your professional quotation for this lead</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Quotation Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                                placeholder="Ref No: QT-2024-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Valid Until</label>
                            <input
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-widest">Line Items</h4>
                            <button
                                onClick={addLineItem}
                                className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                <div className="col-span-6">Description</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Amount</div>
                            </div>

                            {lineItems.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 group items-center">
                                    <div className="col-span-6">
                                        <input
                                            type="text"
                                            placeholder="Service or Product description"
                                            value={item.description}
                                            onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                            className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-neutral-800 transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                                            className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateLineItem(idx, 'unitPrice', e.target.value)}
                                                className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl pl-6 pr-3 py-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <div className="flex-1 bg-neutral-800 px-3 py-2 rounded-xl text-right text-sm text-neutral-300 font-medium">
                                            ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                        <button
                                            onClick={() => removeLineItem(idx)}
                                            className="p-1.5 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="mt-12 flex justify-end">
                        <div className="w-full max-w-xs space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">Subtotal</span>
                                <span className="text-white font-medium">${calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 text-sm text-neutral-500 flex items-center gap-1">
                                    <Calculator className="w-3.5 h-3.5" /> Tax (%)
                                </div>
                                <div className="w-24 relative">
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500" />
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 text-sm text-neutral-500 flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" /> Discount
                                </div>
                                <div className="w-24 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">$</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-6 pr-3 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                                <span className="text-lg font-bold text-white">Grand Total</span>
                                <span className="text-2xl font-black text-indigo-400">
                                    ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || lineItems.length === 0}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Quotation
                    </button>
                </div>
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
