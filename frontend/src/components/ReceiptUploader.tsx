'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    X, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    Receipt, 
    ArrowRight,
    Camera,
    Sparkles,
    Calendar,
    Tag,
    Banknote
} from 'lucide-react';
import api from '@/lib/api';

interface ReceiptUploaderProps {
    projectId: string;
    onSuccess: () => void;
    onClose: () => void;
}

interface ExtractedData {
    merchantName: string;
    date: string;
    totalAmount: number;
    currency: string;
    category: string;
    items?: Array<{ name: string; quantity?: number; price?: number }>;
    taxAmount?: number;
}

export default function ReceiptUploader({ projectId, onSuccess, onClose }: ReceiptUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
            setExtractedData(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
            setError(null);
            setExtractedData(null);
        } else {
            setError('Please upload a valid image file (PNG, JPG).');
        }
    };

    const processReceipt = async () => {
        if (!file) return;

        setIsScanning(true);
        setError(null);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = (reader.result as string).split(',')[1];
                
                try {
                    const response = await api.post('/transactions/process-receipt', {
                        fileBuffer: base64String,
                        fileType: file.type
                    });

                    setExtractedData(response.data);
                } catch (err: any) {
                    console.error('OCR Error:', err);
                    setError(err.response?.data?.error || 'AI Extraction failed. Please try a clearer photo.');
                } finally {
                    setIsScanning(false);
                }
            };
        } catch (err) {
            setIsScanning(false);
            setError('Failed to read file.');
        }
    };

    const handleSave = async () => {
        if (!extractedData) return;

        setIsSaving(true);
        try {
            await api.post('/projects/transactions', {
                projectId,
                amount: extractedData.totalAmount,
                date: extractedData.date,
                type: 'EXPENSE',
                category: extractedData.category,
                description: `AI Extracted: ${extractedData.merchantName}`,
                method: 'CASH', // Defaulting to cash for receipts, can be updated by user
                receiptData: extractedData
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save transaction.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-neutral-900/80 border-indigo-500/20 shadow-2xl"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Upload / Preview */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col items-center justify-center bg-neutral-950/40 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                        <Receipt className="w-96 h-96" />
                    </div>

                    {!preview ? (
                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full min-h-[300px] border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                        >
                            <div className="p-4 bg-neutral-900 rounded-full group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-neutral-500 group-hover:text-indigo-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Drop Receipt Here</p>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">or click to browse filesystem</p>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                            <img 
                                src={preview} 
                                alt="Receipt Preview" 
                                className="w-full h-full object-contain bg-neutral-900" 
                            />
                            <button 
                                onClick={() => { setFile(null); setPreview(null); setExtractedData(null); }}
                                className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-rose-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Analysis & Confirmation */}
                <div className="p-10 flex flex-col relative">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">AI Pulse Scanner</h2>
                        </div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-relaxed">
                            Neural extraction engine for automated expense digitization.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {!extractedData && !isScanning && !error && (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 mb-6">
                                    <Camera className="w-12 h-12 text-indigo-500/50" />
                                </div>
                                <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest leading-loose max-w-[240px]">
                                    Upload a high-fidelity image of your receipt to initiate neural parsing.
                                </p>
                                {file && (
                                    <button 
                                        onClick={processReceipt}
                                        className="mt-8 px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-3"
                                    >
                                        Initiate Scan <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {isScanning && (
                            <div className="h-full flex flex-col items-center justify-center py-12">
                                <div className="relative">
                                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"
                                    />
                                </div>
                                <h3 className="mt-8 text-sm font-black text-white uppercase tracking-[0.2em] italic">Deconstructing Receipt...</h3>
                                <p className="mt-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Identifying core assets and identifiers</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col items-center text-center gap-4">
                                <AlertCircle className="w-8 h-8 text-rose-500" />
                                <div>
                                    <p className="text-sm font-black text-rose-500 uppercase">Analysis Interrupted</p>
                                    <p className="text-[10px] text-neutral-500 font-bold mt-1">{error}</p>
                                </div>
                                <button 
                                    onClick={() => { setError(null); processReceipt(); }}
                                    className="px-6 py-2 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                                >
                                    Re-attempt Scan
                                </button>
                            </div>
                        )}

                        {extractedData && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6 pb-20"
                            >
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Extraction successful - verify identifiers below</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Merchant */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Merchant Asset</label>
                                        <div className="relative group">
                                            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-500 transition-colors" />
                                            <input 
                                                type="text"
                                                value={extractedData.merchantName}
                                                onChange={(e) => setExtractedData({...extractedData, merchantName: e.target.value})}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {/* Amount & Currency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Asset Value</label>
                                            <div className="relative group">
                                                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-500 transition-colors" />
                                                <input 
                                                    type="number"
                                                    value={extractedData.totalAmount}
                                                    onChange={(e) => setExtractedData({...extractedData, totalAmount: parseFloat(e.target.value)})}
                                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-black focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Currency</label>
                                            <input 
                                                type="text"
                                                value={extractedData.currency}
                                                onChange={(e) => setExtractedData({...extractedData, currency: e.target.value})}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-indigo-500 outline-none transition-all uppercase text-center"
                                            />
                                        </div>
                                    </div>

                                    {/* Date & Category */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Event Timeline</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-500 transition-colors" />
                                                <input 
                                                    type="date"
                                                    value={extractedData.date.split('T')[0]}
                                                    onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-[11px] text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Classification</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-indigo-500 transition-colors" />
                                                <select 
                                                    value={extractedData.category}
                                                    onChange={(e) => setExtractedData({...extractedData, category: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-xs text-indigo-400 font-black focus:border-indigo-500 outline-none transition-all appearance-none uppercase"
                                                >
                                                    <option value="GENERAL">General</option>
                                                    <option value="TRAVEL">Travel</option>
                                                    <option value="MEALS">Meals</option>
                                                    <option value="SOFTWARE">Software / SaaS</option>
                                                    <option value="OFFICE_SUPPLIES">Office Assets</option>
                                                    <option value="MARKETING">Marketing</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List (if any) */}
                                    {extractedData.items && extractedData.items.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">Itemized Breakdown</label>
                                            <div className="bg-neutral-950 rounded-xl border border-neutral-800 divide-y divide-neutral-900 overflow-hidden">
                                                {extractedData.items.map((item, idx) => (
                                                    <div key={idx} className="px-4 py-2 flex justify-between items-center text-[10px]">
                                                        <span className="text-neutral-400 font-bold uppercase">{item.name}</span>
                                                        <span className="text-white font-black">₹{item.price || 0}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-auto pt-6 border-t border-neutral-800/50 flex gap-4 bg-neutral-900 md:bg-transparent -mx-10 px-10">
                        {extractedData && (
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>Processing Meta-Data <Loader2 className="w-4 h-4 animate-spin" /></>
                                ) : (
                                    <>Commit to Ledger <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
