"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiscoveryDataView from './DiscoveryDataView';
import { PartnerAssignmentModal } from './PartnerAssignmentModal';
import ColdEmailModal from './ColdEmailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Building, DollarSign, FileText, Loader2, MessageSquare, Check, Plus, Users, UserPlus, Sparkles } from 'lucide-react';

interface Enquiry {
    id: string;
    enquiryId: string;
    clientName: string;
    companyName?: string;
    email: string;
    phone?: string;
    country?: string;
    servicesRequested: string[];
    stage: string;
    estimatedValue?: number;
    probability?: number;
    discoveryData?: Record<string, any>;
    createdAt: string;
    projectId?: string;
}

interface EnquiryDetailPanelProps {
    enquiry: Enquiry | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EnquiryDetailPanel({ enquiry, isOpen, onClose, onUpdate }: EnquiryDetailPanelProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [submittingNote, setSubmittingNote] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    
    // Stage update
    const [stage, setStage] = useState(enquiry?.stage || 'NEW');

    useEffect(() => {
        if (enquiry) {
            setStage(enquiry.stage);
            fetchNotes();
        }
    }, [enquiry]);

    const fetchNotes = async () => {
        if (!enquiry) return;
        setLoadingNotes(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiry.id}/notes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(res.data);
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !enquiry) return;
        setSubmittingNote(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiry.id}/notes`, 
                { content: newNote },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setNewNote('');
            fetchNotes();
        } catch (error) {
            console.error("Failed to add note", error);
        } finally {
            setSubmittingNote(false);
        }
    };

    const handleStageChange = async (newStage: string) => {
        if (!enquiry) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${enquiry.id}`, 
                { stage: newStage },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setStage(newStage);
            onUpdate();
        } catch (error) {
            console.error("Failed to update stage", error);
            alert("Failed to update stage");
        }
    };

    if (!isOpen || !enquiry) return null;

    const stages = [
        "NEW", "DISCOVERY_SENT", "DISCOVERY_SUBMITTED", 
        "REVIEW", "PROPOSAL", "NEGOTIATION", "APPROVED", "DECLINED"
    ];

    return (
        <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#0a0f16]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider rounded border border-white/20 bg-white/10 text-white">
                            {enquiry.enquiryId}
                        </span>
                        <h2 className="text-xl font-bold text-white">{enquiry.clientName}</h2>
                    </div>
                    {enquiry.companyName && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Building className="w-3.5 h-3.5" />
                            {enquiry.companyName}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stage Selector */}
            <div className="p-6 border-b border-white/5 bg-[#0a0f16]">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Pipeline Stage</p>
                <div className="flex flex-wrap gap-2">
                    {stages.map(s => {
                        const isActive = stage === s;
                        return (
                            <button
                                key={s}
                                onClick={() => handleStageChange(s)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                            >
                                {s.replace(/_/g, ' ')}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-white/5">
                {['details', 'notes', 'discovery', 'documents'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 text-sm font-medium capitalize border-b-2 transition-all ${activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {activeTab === 'details' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Highlights */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> Est. Value</p>
                                <p className="text-xl font-bold text-emerald-400">${enquiry.estimatedValue?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1.5"><Check className="w-3.5 h-3.5"/> Probability</p>
                                <p className="text-xl font-bold text-indigo-400">{enquiry.probability || 0}%</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-neutral-300">
                                    <div className="p-2 rounded-lg bg-white/5"><Mail className="w-4 h-4 text-blue-400"/></div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <a href={`mailto:${enquiry.email}`} className="hover:text-blue-400 transition-colors">{enquiry.email}</a>
                                        <button 
                                            onClick={() => setShowEmailModal(true)}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-[10px] font-bold uppercase"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            AI Draft
                                        </button>
                                    </div>
                                </div>
                                {enquiry.phone && (
                                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                                        <div className="p-2 rounded-lg bg-white/5"><Phone className="w-4 h-4 text-green-400"/></div>
                                        <a href={`tel:${enquiry.phone}`} className="hover:text-green-400 transition-colors">{enquiry.phone}</a>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-neutral-300">
                                    <div className="p-2 rounded-lg bg-white/5"><Calendar className="w-4 h-4 text-orange-400"/></div>
                                    <span>Created {new Date(enquiry.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-4">Requested Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {enquiry.servicesRequested.map((srv, idx) => (
                                    <span key={idx} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        {srv}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Project Operations (If converted) */}
                        {enquiry.projectId && (
                            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <Users className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Project Operations</h3>
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Team & Resources</p>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                                    This enquiry has been converted to a project. You can now assign partners to lead various roles for this project.
                                </p>
                                <button 
                                    onClick={() => setShowAssignmentModal(true)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                                >
                                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Assign Partners & Leads
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="h-full flex flex-col animate-in fade-in duration-300">
                        <div className="flex-1 space-y-4 mb-6">
                            {loadingNotes ? (
                                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
                            ) : notes.length === 0 ? (
                                <p className="text-center text-neutral-500 py-8">No internal notes yet.</p>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white">{note.user?.name || 'User'}</span>
                                            <span className="text-xs text-neutral-500">{new Date(note.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-neutral-300 bg-white/5 p-3 rounded-lg border border-white/5">{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleAddNote} className="mt-auto relative">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add an internal note..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                                rows={3}
                            />
                            <button
                                type="submit"
                                disabled={submittingNote || !newNote.trim()}
                                className="absolute bottom-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                {submittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'discovery' && (
                    <div className="animate-in fade-in duration-300">
                        <DiscoveryDataView 
                            enquiryId={enquiry.id} 
                            discoveryData={enquiry.discoveryData} 
                            onRefresh={onUpdate} 
                        />
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="animate-in fade-in duration-300 text-center py-12">
                        <FileText className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Documents & Generators</h3>
                        <p className="text-sm text-neutral-400 mb-6 max-w-sm mx-auto">Generate proposals, quotations, and NDAs directly connected to this lead.</p>
                        <button onClick={() => window.location.href = `/dashboard/enquiries/${enquiry.id}?tab=documents`} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors inline-flex items-center gap-2 text-sm">
                            Open Full View
                        </button>
                    </div>
                )}
            </div>

            {/* Partner Assignment Modal */}
            {enquiry.projectId && (
                <PartnerAssignmentModal 
                    isOpen={showAssignmentModal}
                    onClose={() => setShowAssignmentModal(false)}
                    projectId={enquiry.projectId}
                    targetService={enquiry.servicesRequested[0]} // Pass first service as match hint
                />
            )}

            {/* Cold Email Modal */}
            <AnimatePresence>
                {showEmailModal && (
                    <ColdEmailModal 
                        enquiryId={enquiry.id}
                        onClose={() => {
                            setShowEmailModal(false);
                            fetchNotes(); // Refresh to show the sent email note
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
