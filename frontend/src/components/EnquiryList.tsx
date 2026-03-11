"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Loader2, Link as LinkIcon, Eye, Building, Calendar, Phone, Edit2, Trash2, X } from 'lucide-react';

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

export default function EnquiryList() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState<{ isOpen: boolean; enquiry: Enquiry | null }>({ isOpen: false, enquiry: null });

    const fetchEnquiries = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnquiries(res.data);
        } catch (error) {
            console.error("Failed to fetch enquiries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Discovery Link copied to clipboard!');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnquiries(enquiries.filter(e => e.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete enquiry');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.enquiry) return;

        try {
            const token = localStorage.getItem('accessToken');
            const { id, ...data } = editModal.enquiry;
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditModal({ isOpen: false, enquiry: null });
            fetchEnquiries();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to update enquiry');
        }
    };

    const calculateStats = () => {
        const total = enquiries.reduce((sum, e) => sum + (e.estimatedValue || 0), 0);
        const weighted = enquiries.reduce((sum, e) => sum + ((e.estimatedValue || 0) * ((e.probability || 0) / 100)), 0);
        return { total, weighted };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Forecasting Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Leads</p>
                    <p className="text-2xl font-bold">{enquiries.length}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Pipeline Value</p>
                    <p className="text-2xl font-bold text-indigo-400">${stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Weighted Value</p>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">Forecast</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">${stats.weighted.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex flex-col h-full bg-neutral-900 rounded-2xl border border-neutral-800">
                {/* Header */}
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">All Enquiries</h2>
                    <div className="text-sm text-neutral-500">
                        {enquiries.length} enquiries in pipeline
                    </div>
                </div>

                {/* List / Table View */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-neutral-400">
                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-900 border-b border-neutral-800">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Enquiry Detail</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Value ($)</th>
                                <th scope="col" className="px-6 py-4 font-medium text-center">Prob (%)</th>
                                <th scope="col" className="px-6 py-4 font-medium">Services</th>
                                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enquiries.map((enquiry) => (
                                <tr key={enquiry.id} className="bg-neutral-900/50 border-b border-neutral-800 hover:bg-neutral-800/80 transition-colors">
                                    {/* Detail Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white">{enquiry.clientName}</span>
                                                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
                                                    {enquiry.enquiryId}
                                                </span>
                                            </div>
                                            {enquiry.companyName && (
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                                                    <Building className="w-3.5 h-3.5" />
                                                    {enquiry.companyName}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(enquiry.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Value Column */}
                                    <td className="px-6 py-4 text-right font-medium text-neutral-200">
                                        {enquiry.estimatedValue ? `$${enquiry.estimatedValue.toLocaleString()}` : '-'}
                                    </td>

                                    {/* Probability Column */}
                                    <td className="px-6 py-4 text-center">
                                        {enquiry.probability ? (
                                            <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">
                                                {enquiry.probability}%
                                            </span>
                                        ) : '-'}
                                    </td>

                                    {/* Services Column */}
                                    <td className="px-6 py-4 max-w-[250px]">
                                        <div className="flex flex-wrap gap-1.5">
                                            {enquiry.servicesRequested.map((srv, idx) => (
                                                <span key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 whitespace-normal">
                                                    {srv}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    {/* Stage Column */}
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-[10px] font-medium rounded bg-neutral-800 text-neutral-300 border border-neutral-700 capitalize">
                                            {enquiry.stage.toLowerCase().replace(/_/g, ' ')}
                                        </span>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => (window.location.href = `/dashboard/enquiries/${enquiry.id}`)}
                                                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded transition-colors border border-neutral-700"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditModal({ isOpen: true, enquiry })}
                                                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded transition-colors border border-neutral-700"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(enquiry.id)}
                                                disabled={!!enquiry.projectId}
                                                className={`p-1.5 rounded transition-colors border ${enquiry.projectId ? 'opacity-30 cursor-not-allowed bg-neutral-900 border-neutral-800 text-neutral-600' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20'}`}
                                                title={enquiry.projectId ? "Cannot delete converted project" : "Delete Enquiry"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {enquiries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 bg-neutral-900/50">
                                        No enquiries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editModal.isOpen && editModal.enquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                            <div>
                                <h3 className="text-xl font-bold">Edit Lead</h3>
                                <p className="text-xs text-neutral-500 mt-1">{editModal.enquiry.enquiryId} • {editModal.enquiry.clientName}</p>
                            </div>
                            <button onClick={() => setEditModal({ isOpen: false, enquiry: null })} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">Client Name</label>
                                    <input
                                        type="text"
                                        value={editModal.enquiry.clientName}
                                        onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, clientName: e.target.value } })}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={editModal.enquiry.companyName || ''}
                                        onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, companyName: e.target.value } })}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={editModal.enquiry.email}
                                        onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, email: e.target.value } })}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editModal.enquiry.phone || ''}
                                        onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, phone: e.target.value } })}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">Est. Value ($)</label>
                                    <input
                                        type="number"
                                        value={editModal.enquiry.estimatedValue || ''}
                                        onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, estimatedValue: parseFloat(e.target.value) || 0 } })}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 font-mono text-indigo-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">Probability (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editModal.enquiry.probability || ''}
                                        onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, probability: parseInt(e.target.value) || 0 } })}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 font-mono text-green-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-400 ml-1">Pipeline Stage</label>
                                <select
                                    value={editModal.enquiry.stage}
                                    onChange={(e) => setEditModal({ ...editModal, enquiry: { ...editModal.enquiry!, stage: e.target.value } })}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="NEW">New Lead</option>
                                    <option value="DISCOVERY_SENT">Discovery Sent</option>
                                    <option value="DISCOVERY_SUBMITTED">Discovery Submitted</option>
                                    <option value="REVIEW">Internal Review</option>
                                    <option value="PROPOSAL">Proposal Phase</option>
                                    <option value="NEGOTIATION">Negotiation</option>
                                    <option value="APPROVED">Approved / Won</option>
                                    <option value="DECLINED">Declined / Lost</option>
                                </select>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModal({ isOpen: false, enquiry: null })}
                                    className="flex-1 px-6 py-3 rounded-xl border border-neutral-800 text-neutral-400 font-semibold hover:bg-neutral-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
