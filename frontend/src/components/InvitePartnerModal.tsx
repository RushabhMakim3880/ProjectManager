import React, { useState, useEffect } from 'react';
import {
    X, User, Mail, Shield, Star, Loader2, Phone, MapPin,
    Globe, Lock, CheckCircle2, DollarSign, Briefcase,
    ClipboardCheck, Signature, Activity, ChevronRight, ChevronLeft,
    AlertCircle, Banknote, Landmark, Wallet, CreditCard, Send, Link as LinkIcon, Copy, Check
} from 'lucide-react';
import api from '@/lib/api';

interface InvitePartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = [
    { id: 'basic', title: 'Basic Information', icon: User },
    { id: 'role', title: 'Role & Initial Terms', icon: Shield },
    { id: 'confirm', title: 'Confirm & Send', icon: Send },
];

const INITIAL_FORM_DATA = {
    name: '',
    email: '',
    role: 'PARTNER',
    partnerType: 'NON_EQUITY',
    isEquity: false,
    equityPercentage: 0,
};

export default function InvitePartnerModal({ isOpen, onClose, onSuccess }: InvitePartnerModalProps) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inviteResult, setInviteResult] = useState<{ onboardingUrl: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(INITIAL_FORM_DATA);
            setStep(0);
            setError('');
            setInviteResult(null);
            setCopied(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/invitations', formData);
            setInviteResult(res.data);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (inviteResult?.onboardingUrl) {
            navigator.clipboard.writeText(inviteResult.onboardingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const StepIcon = STEPS[step].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                            <StepIcon className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-none">{inviteResult ? 'Invitation Sent!' : STEPS[step].title}</h2>
                            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-bold">
                                {inviteResult ? 'Next Steps' : `Step ${step + 1} of ${STEPS.length}`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                {!inviteResult && (
                    <div className="flex h-1 bg-neutral-900">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 transition-all duration-500 ${i <= step ? 'bg-indigo-500' : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {inviteResult ? (
                        <div className="space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Invite Created Successfully</h3>
                                <p className="text-neutral-400 max-w-sm mx-auto">
                                    The invitation has been logged. Share the secure onboarding link with {formData.name} to complete their setup.
                                </p>
                            </div>

                            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Shareable Onboarding Link</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-neutral-300 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                        {inviteResult.onboardingUrl}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
                                    <p className="text-xs text-neutral-500 mb-1">Invitee</p>
                                    <p className="text-white font-bold">{formData.name}</p>
                                </div>
                                <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
                                    <p className="text-xs text-neutral-500 mb-1">Email</p>
                                    <p className="text-white font-bold truncate">{formData.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl transition-all"
                            >
                                Close Modal
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {step === 0 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 gap-6">
                                        <FormGroup label="Full Legal Name" required>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                                <input required className="input-field pl-10" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. John Doe" />
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="Email (Login/Invited)" required>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                                <input required type="email" className="input-field pl-10" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="john@example.com" />
                                            </div>
                                        </FormGroup>
                                    </div>
                                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                        <p className="text-xs text-indigo-400 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            The partner will provide their own bank details and password during onboarding.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormGroup label="Partner Type">
                                            <select className="input-field" value={formData.partnerType} onChange={e => handleChange('partnerType', e.target.value)}>
                                                <option value="NON_EQUITY">Non-Equity Partner</option>
                                                <option value="EQUITY">Equity Partner</option>
                                                <option value="CONTRACTOR">Contractor</option>
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="System Access Level">
                                            <select className="input-field" value={formData.role} onChange={e => handleChange('role', e.target.value)}>
                                                <option value="PARTNER">Partner</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </FormGroup>
                                    </div>

                                    <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <label className="text-sm font-bold text-white">Equity Holder</label>
                                                <p className="text-xs text-neutral-500">Will this partner hold company shares?</p>
                                            </div>
                                            <Toggle label="" value={formData.isEquity} onChange={v => handleChange('isEquity', v)} />
                                        </div>

                                        {formData.isEquity && (
                                            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                                                <label className="text-sm font-bold text-white">Equity Percentage (%)</label>
                                                <div className="w-24">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="input-field text-center font-bold"
                                                        value={formData.equityPercentage}
                                                        onChange={e => handleChange('equityPercentage', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl text-center space-y-4">
                                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto">
                                            <Send className="w-8 h-8 text-indigo-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Ready to Invite</h3>
                                        <p className="text-neutral-400 leading-relaxed">
                                            An onboarding link will be generated for <strong>{formData.name}</strong>.
                                            This link allows them to securely set up their account and accept the partnership agreement.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
                                            <p className="text-xs text-neutral-500 mb-1">Contract Type</p>
                                            <p className="text-white font-bold">{formData.partnerType.replace('_', ' ')}</p>
                                        </div>
                                        <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
                                            <p className="text-xs text-neutral-500 mb-1">Equity</p>
                                            <p className="text-white font-bold">{formData.isEquity ? `${formData.equityPercentage}%` : '0%'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                {!inviteResult && (
                    <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={step === 0 ? onClose : handleBack}
                            className="px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 font-semibold hover:bg-neutral-800 hover:text-white transition-all flex items-center gap-2"
                        >
                            {step === 0 ? 'Cancel' : <><ChevronLeft className="w-4 h-4" /> Back</>}
                        </button>

                        <div className="flex gap-3">
                            {step < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={loading}
                                    className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Invitation</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FormGroup({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function Toggle({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${value
                ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                : 'bg-neutral-900/30 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                }`}
        >
            <div className={`w-10 h-6 rounded-full relative transition-colors ${value ? 'bg-indigo-500' : 'bg-neutral-800'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-5' : 'left-1'}`} />
            </div>
        </button>
    );
}
