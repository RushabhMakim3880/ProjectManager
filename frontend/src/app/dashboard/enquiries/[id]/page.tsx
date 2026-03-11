"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    ArrowLeft,
    Save,
    MessageSquare,
    Briefcase,
    ChevronRight,
    User,
    Calendar,
    Mail,
    Phone,
    Globe,
    FileText,
    Percent,
    DollarSign,
    Trash2,
    Loader2,
    Eye,
    Plus,
    X,
    Download
} from 'lucide-react';
import QuotationBuilder from '@/components/QuotationBuilder';
import ProposalBuilder from '@/components/ProposalBuilder';
import { pdf } from '@react-pdf/renderer';
import { DocumentPDF } from '@/components/PDFGenerator';
import { saveAs } from 'file-saver';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EnquiryDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [enquiry, setEnquiry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [noteContent, setNoteContent] = useState('');
    const [notes, setNotes] = useState<any[]>([]);
    const [savingNote, setSavingNote] = useState(false);
    const [updatingEnquiry, setUpdatingEnquiry] = useState(false);
    const [converting, setConverting] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
    const [quotations, setQuotations] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [showQuotationBuilder, setShowQuotationBuilder] = useState(false);
    const [showProposalBuilder, setShowProposalBuilder] = useState(false);
    const [systemSettings, setSystemSettings] = useState<any>(null);

    useEffect(() => {
        fetchEnquiryDetails();
        fetchDocuments();
    }, [id]);

    const fetchEnquiryDetails = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(`${API_URL}/enquiries/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnquiry(res.data);
            setNotes(res.data.notes || []);
        } catch (error) {
            console.error('Error fetching enquiry details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        setLoadingDocs(true);
        try {
            const token = localStorage.getItem('accessToken');
            const [qRes, pRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/enquiries/${id}/quotations`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/enquiries/${id}/proposals`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/system/settings`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setQuotations(qRes.data);
            setProposals(pRes.data);
            setSystemSettings(sRes.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const downloadPDF = async (doc: any, type: 'QUOTATION' | 'PROPOSAL') => {
        try {
            const blob = await pdf(
                <DocumentPDF
                    data={doc}
                    settings={systemSettings || {}}
                    type={type}
                />
            ).toBlob();
            saveAs(blob, `${type}_${id}_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    const handleUpdateEnquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingEnquiry(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`${API_URL}/enquiries/${id}`, {
                estimatedValue: parseFloat(enquiry.estimatedValue) || 0,
                probability: parseInt(enquiry.probability) || 0,
                stage: enquiry.stage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Enquiry updated successfully!');
        } catch (error) {
            console.error('Error updating enquiry:', error);
        } finally {
            setUpdatingEnquiry(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteContent.trim()) return;
        setSavingNote(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.post(`${API_URL}/enquiries/${id}/notes`, {
                content: noteContent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes([res.data, ...notes]);
            setNoteContent('');
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`${API_URL}/enquiries/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleConvertToProject = async () => {
        if (!confirm('This will create an active project. Are you sure?')) return;
        setConverting(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.post(`${API_URL}/enquiries/${id}/convert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Lead converted to Project successfully!');
            router.push(`/dashboard/projects`);
        } catch (error) {
            console.error('Error converting lead:', error);
        } finally {
            setConverting(false);
        }
    };

    if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-indigo-500"><Loader2 className="w-12 h-12 animate-spin" /></div>;
    if (!enquiry) return <div className="p-8 text-center text-neutral-400">Enquiry not found.</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 hover:bg-neutral-800 rounded-xl text-neutral-400 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">{enquiry.companyName || enquiry.clientName}</h1>
                        <p className="text-neutral-400 flex items-center gap-2 font-medium mt-1">
                            <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px] text-neutral-300 font-bold border border-neutral-700">{enquiry.enquiryId}</span>
                            <span>•</span>
                            <span>Lead Received {new Date(enquiry.createdAt).toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleConvertToProject}
                        disabled={converting || enquiry.projectId}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                        {converting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                        {enquiry.projectId ? 'Converted to Project' : 'Convert to Project'}
                    </button>
                    <Link
                        href={`/discovery/${id}`}
                        target="_blank"
                        className="bg-neutral-800 hover:bg-neutral-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border border-neutral-700 active:scale-95"
                    >
                        <FileText className="w-5 h-5" />
                        Discovery Form
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    Documents & Generators
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Lead Info & Sales Controls */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Contact Info Card */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 space-y-6">
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Lead Information</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400"><User className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">Contact Name</p>
                                        <p className="text-base font-medium text-neutral-200">{enquiry.clientName}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400"><Mail className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">Email</p>
                                        <p className="text-base font-medium text-neutral-200">{enquiry.email}</p>
                                    </div>
                                </div>
                                {enquiry.phone && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400"><Phone className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">Phone</p>
                                            <p className="text-base font-medium text-neutral-200">{enquiry.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {enquiry.country && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400"><Globe className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">Location</p>
                                            <p className="text-base font-medium text-neutral-200">{enquiry.country}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sales Controls Card */}
                        <form onSubmit={handleUpdateEnquiry} className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-6 space-y-6">
                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Sales Forecasting</h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Deal Stage</label>
                                    <select
                                        value={enquiry.stage}
                                        onChange={(e) => setEnquiry({ ...enquiry, stage: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="NEW">New Lead</option>
                                        <option value="DISCOVERY_SENT">Discovery Sent</option>
                                        <option value="DISCOVERY_SUBMITTED">Discovery Received</option>
                                        <option value="REVIEW">Under Review</option>
                                        <option value="PROPOSAL">Proposal Phase</option>
                                        <option value="NEGOTIATION">Negotiation</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="DECLINED">Declined</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Estimated Value</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                        <input
                                            type="number"
                                            value={enquiry.estimatedValue || ''}
                                            onChange={(e) => setEnquiry({ ...enquiry, estimatedValue: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Probability (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={enquiry.probability || ''}
                                            onChange={(e) => setEnquiry({ ...enquiry, probability: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="60"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingEnquiry}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                >
                                    {updatingEnquiry ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Update Forecast
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Internal Activity Log & Services */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Services Requested */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Requested Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {enquiry.servicesRequested?.map((service: string) => (
                                    <span key={service} className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Internal Activity Log */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col h-[650px] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80 backdrop-blur-md">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                                    Internal Activity Log
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Live Collaboration</span>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-neutral-950/20">
                                {notes.length === 0 ? (
                                    <div className="text-center py-20 text-neutral-600">
                                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-800">
                                            <MessageSquare className="w-10 h-10 opacity-20" />
                                        </div>
                                        <p className="font-medium">No internal notes yet.</p>
                                        <p className="text-sm">Start the conversation by adding a note below.</p>
                                    </div>
                                ) : (
                                    notes.map((note) => (
                                        <div key={note.id} className="group flex gap-4">
                                            <div className="w-10 h-10 shrink-0 bg-neutral-800 rounded-2xl flex items-center justify-center text-xs font-bold text-white border border-neutral-700 shadow-lg">
                                                {(note.user?.displayName || note.user?.name || 'U')[0]}
                                            </div>
                                            <div className="flex-1 bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl group-hover:border-neutral-700 transition-all relative">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-neutral-300">
                                                            {note.user?.displayName || note.user?.name || 'System User'}
                                                        </span>
                                                        <span className="text-[10px] text-neutral-500 font-medium">
                                                            {new Date(note.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Note Input */}
                            <div className="p-6 border-t border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
                                <form onSubmit={handleAddNote} className="space-y-4">
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Add an internal note or update about this lead..."
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none transition-all"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={savingNote || !noteContent.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
                                        >
                                            {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                            Post Note
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Proposals Card */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Proposals</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Project scopes and legal terms</p>
                                </div>
                                <button
                                    onClick={() => setShowProposalBuilder(true)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl shadow-lg transition-all active:scale-90"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {loadingDocs ? (
                                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-700" /></div>
                                ) : proposals.length === 0 ? (
                                    <div className="text-center py-10 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-2xl">
                                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-10" />
                                        <p className="text-sm font-medium">No proposals generated</p>
                                        <button
                                            onClick={() => setShowProposalBuilder(true)}
                                            className="text-indigo-500 text-xs font-bold mt-2 hover:underline"
                                        >
                                            Start Builder
                                        </button>
                                    </div>
                                ) : (
                                    proposals.map((p: any) => (
                                        <div key={p.id} className="flex items-center justify-between p-4 bg-neutral-950/50 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500"><FileText className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">Proposal #{p.id.slice(-4)}</p>
                                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{new Date(p.createdAt).toLocaleDateString()} • {p.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); downloadPDF(p, 'PROPOSAL'); }}
                                                    className="p-2.5 hover:bg-neutral-800 rounded-xl text-neutral-500 hover:text-indigo-400 transition-all border border-neutral-800"
                                                    title="Download Proposal PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quotations Card */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Quotations</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Financial breakdowns and pricing</p>
                                </div>
                                <button
                                    onClick={() => setShowQuotationBuilder(true)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl shadow-lg transition-all active:scale-90"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {loadingDocs ? (
                                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-700" /></div>
                                ) : quotations.length === 0 ? (
                                    <div className="text-center py-10 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-2xl">
                                        <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-10" />
                                        <p className="text-sm font-medium">No quotations generated</p>
                                        <button
                                            onClick={() => setShowQuotationBuilder(true)}
                                            className="text-indigo-500 text-xs font-bold mt-2 hover:underline"
                                        >
                                            Start Builder
                                        </button>
                                    </div>
                                ) : (
                                    quotations.map((q: any) => (
                                        <div key={q.id} className="flex items-center justify-between p-4 bg-neutral-950/50 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><DollarSign className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">${(q.totalAmount || 0).toLocaleString()}</p>
                                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{new Date(q.createdAt).toLocaleDateString()} • {q.status || 'DRAFT'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); downloadPDF(q, 'QUOTATION'); }}
                                                    className="p-2.5 hover:bg-neutral-800 rounded-xl text-neutral-500 hover:text-emerald-400 transition-all border border-neutral-800"
                                                    title="Download Quotation PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modals/Builders */}
            {showQuotationBuilder && (
                <QuotationBuilder
                    enquiryId={id as string}
                    initialServices={enquiry?.servicesRequested}
                    onClose={() => setShowQuotationBuilder(false)}
                    onSave={() => fetchDocuments()}
                />
            )}
            {showProposalBuilder && (
                <ProposalBuilder
                    enquiryId={id as string}
                    initialServices={enquiry?.servicesRequested}
                    onClose={() => setShowProposalBuilder(false)}
                    onSave={() => fetchDocuments()}
                />
            )}
        </div>
    );
}
