import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Code, MessageSquare, CheckCircle, Users, Search, Star, Briefcase } from 'lucide-react';
import axios from 'axios';

interface Partner {
    id: string;
    userId: string;
    user: {
        name: string;
        email: string;
        displayName: string;
    };
    skills: string; // Comma-separated
    canLeadProjects: boolean;
}

interface Project {
    id: string;
    name: string;
    projectLeadId?: string | null;
    techLeadId?: string | null;
    commsLeadId?: string | null;
    qaLeadId?: string | null;
    salesOwnerId?: string | null;
}

interface PartnerAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    initialData?: Project;
    onSuccess?: () => void;
    targetService?: string; // Optional context for skill matching
}

const ROLES = [
    { id: 'projectLeadId', label: 'Project Lead', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'techLeadId', label: 'Tech Lead', icon: Code, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'commsLeadId', label: 'Comms Lead', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'qaLeadId', label: 'QA Lead', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'salesOwnerId', label: 'Sales Owner', icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

export const PartnerAssignmentModal: React.FC<PartnerAssignmentModalProps> = ({ 
    isOpen, 
    onClose, 
    projectId, 
    initialData, 
    onSuccess,
    targetService
}) => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [assignments, setAssignments] = useState<Record<string, string>>({
        projectLeadId: initialData?.projectLeadId || '',
        techLeadId: initialData?.techLeadId || '',
        commsLeadId: initialData?.commsLeadId || '',
        qaLeadId: initialData?.qaLeadId || '',
        salesOwnerId: initialData?.salesOwnerId || '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchPartners();
            if (initialData) {
                setAssignments({
                    projectLeadId: initialData.projectLeadId || '',
                    techLeadId: initialData.techLeadId || '',
                    commsLeadId: initialData.commsLeadId || '',
                    qaLeadId: initialData.qaLeadId || '',
                    salesOwnerId: initialData.salesOwnerId || '',
                });
            }
        }
    }, [isOpen, initialData]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/partners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPartners(response.data);
        } catch (err) {
            setError('Failed to fetch partners');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, assignments, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save assignments');
        } finally {
            setSaving(false);
        }
    };

    const filteredPartners = partners.filter(p => 
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const checkSkillMatch = (partner: Partner) => {
        if (!targetService) return false;
        const skills = partner.skills?.toLowerCase().split(',') || [];
        return skills.some(s => s.trim().includes(targetService.toLowerCase()) || targetService.toLowerCase().includes(s.trim()));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-black">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                            <UserPlus className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Assign Project Team</h2>
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mt-0.5">Management & Operations</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Role Selection (Left) */}
                    <div className="w-full lg:w-1/2 p-6 border-r border-neutral-800 overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Briefcase className="w-4 h-4" /> Define Project Leads
                        </h3>
                        
                        <div className="space-y-4">
                            {ROLES.map((role) => {
                                const Icon = role.icon;
                                const assignedPartner = partners.find(p => p.id === assignments[role.id]);
                                
                                return (
                                    <div 
                                        key={role.id}
                                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                                            assignments[role.id] 
                                                ? 'bg-neutral-800/50 border-neutral-700 shadow-lg ring-1 ring-neutral-700' 
                                                : 'bg-black/20 border-neutral-800/50 grayscale opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${role.bg}`}>
                                                    <Icon className={`w-4 h-4 ${role.color}`} />
                                                </div>
                                                <span className="text-sm font-bold text-white">{role.label}</span>
                                            </div>
                                            {assignments[role.id] && (
                                                <button 
                                                    onClick={() => setAssignments(prev => ({ ...prev, [role.id]: '' }))}
                                                    className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="pl-11">
                                            {assignedPartner ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {assignedPartner.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{assignedPartner.user.name}</p>
                                                        <p className="text-[10px] text-neutral-500">{assignedPartner.user.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs italic text-neutral-600">No partner assigned</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Partner Selection (Right) */}
                    <div className="w-full lg:w-1/2 p-6 bg-black/40 flex flex-col">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input 
                                type="text"
                                placeholder="Search partners or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {loading ? (
                                <div className="flex items-center justify-center h-32 text-neutral-500 text-sm italic">
                                    Loading partners...
                                </div>
                            ) : filteredPartners.length === 0 ? (
                                <div className="flex items-center justify-center h-32 text-neutral-600 text-sm italic border border-dashed border-neutral-800 rounded-2xl">
                                    No partners found matching your search
                                </div>
                            ) : (
                                filteredPartners.map((partner) => (
                                    <div 
                                        key={partner.id}
                                        className="group p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 hover:bg-neutral-800/60 hover:border-neutral-600 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        {checkSkillMatch(partner) && (
                                            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl border-l border-b border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-sm">
                                                <Star className="w-2.5 h-2.5 fill-emerald-400" /> Skill Match
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-400 group-hover:text-white group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                                                    {partner.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{partner.user.name}</h4>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {partner.skills?.split(',').slice(0, 3).map((skill, i) => (
                                                            <span key={i} className="text-[9px] px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full border border-neutral-700 uppercase font-mono tracking-tighter">
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {ROLES.map((role) => (
                                                <button
                                                    key={role.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAssignments(prev => ({ ...prev, [role.id]: partner.id }));
                                                    }}
                                                    className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 ${
                                                        assignments[role.id] === partner.id
                                                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10'
                                                            : 'bg-black/60 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white'
                                                    }`}
                                                    title={`Assign as ${role.label}`}
                                                >
                                                    <role.icon className="w-4 h-4" />
                                                    <span className="text-[8px] font-bold uppercase tracking-tighter">
                                                        {role.label.split(' ')[0]}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between">
                    {error && <p className="text-xs text-red-500 font-medium px-4">{error}</p>}
                    <div className="flex items-center gap-3 ml-auto">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
                        >
                            {saving ? 'Saving...' : (
                                <>
                                    Save Assignments
                                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #262626;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #404040;
                }
            `}</style>
        </div>
    );
};
