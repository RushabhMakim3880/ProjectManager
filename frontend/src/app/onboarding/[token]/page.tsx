'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    X, User, Mail, Shield, Star, Loader2, Phone, MapPin,
    Globe, Lock, CheckCircle2, DollarSign, Briefcase,
    ClipboardCheck, Signature, Activity, ChevronRight, ChevronLeft,
    AlertCircle, Send
} from 'lucide-react';
import api from '@/lib/api';

const STEPS = [
    { id: 'welcome', title: 'Welcome to the Team', icon: Star },
    { id: 'account', title: 'Account Security', icon: Lock },
    { id: 'profile', title: 'Personal Details', icon: User },
    { id: 'financial', title: 'Financial & Banking', icon: DollarSign },
    { id: 'agreement', title: 'Legal Agreement', icon: Signature },
];

export default function OnboardingPage() {
    const params = useParams();
    const token = params?.token as string;
    const router = useRouter();

    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(0);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        emergencyContact: '',
        address: '',
        city: '',
        country: '',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        bankAccountName: '',
        bankAccountNumber: '',
        ifscSwift: '',
        upiId: '',
        payoutMethod: 'BANK_TRANSFER',
        taxIdPan: '',
        currency: 'INR',
        agreementAccepted: false,
        digitalSignature: '',
    });

    useEffect(() => {
        if (!token) return;
        const verify = async () => {
            try {
                const res = await api.get(`/invitations/verify/${token}`);
                setInvitation(res.data);
                setFormData(prev => ({ ...prev, bankAccountName: res.data.name }));
            } catch (err: any) {
                setError(err.response?.data?.error || 'Invalid or expired invitation link');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [token]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }
        setError('');
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const handleBack = () => {
        setError('');
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!formData.agreementAccepted) {
            setError('You must accept the agreement to continue.');
            return;
        }
        if (!formData.digitalSignature) {
            setError('Digital signature is required.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.post(`/invitations/accept/${token}`, formData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to complete onboarding');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-neutral-500 font-medium">Verifying invitation...</p>
                </div>
            </div>
        );
    }

    if (error && step === 0 && !invitation) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-3xl text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                        <X className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Invitation Error</h2>
                    <p className="text-neutral-400">{error}</p>
                    <button onClick={() => router.push('/login')} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all">
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-3xl text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Onboarding Complete!</h2>
                    <p className="text-neutral-400 leading-relaxed">
                        Welcome to the team, <strong>{invitation.name}</strong>. Your partner profile has been successfully created.
                    </p>
                    <button onClick={() => router.push('/login')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all">
                        Login to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const StepIcon = STEPS[step].icon;

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 md:p-8">
            <div className="max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col transition-all">
                {/* Header */}
                <div className="p-8 border-b border-neutral-800 bg-neutral-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                            <StepIcon className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-none">{STEPS[step].title}</h2>
                            <p className="text-xs text-neutral-500 mt-2 uppercase tracking-[0.2em] font-black">Step {step + 1} of {STEPS.length}</p>
                        </div>
                    </div>
                    {/* Progress Pills */}
                    <div className="flex gap-2">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-indigo-500' : 'w-2 bg-neutral-800'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {step === 0 && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                        Hello <span className="text-indigo-400">{invitation.name.split(' ')[0]}</span>,
                                    </h1>
                                    <p className="text-lg text-neutral-400 leading-relaxed max-w-2xl">
                                        You've been invited to join our partner ecosystem as a <strong className="text-white">{invitation.role}</strong>.
                                        Let's get your details finalized so you can start collaborating.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-neutral-950/50 border border-neutral-800 rounded-3xl space-y-2">
                                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Partner Category</p>
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-5 h-5 text-indigo-400" />
                                            <p className="text-white font-bold text-lg">{invitation.partnerType.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-neutral-950/50 border border-neutral-800 rounded-3xl space-y-2">
                                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Equity Rights</p>
                                        <div className="flex items-center gap-3">
                                            <Star className={`w-5 h-5 ${invitation.isEquity ? 'text-amber-400' : 'text-neutral-600'}`} />
                                            <p className="text-white font-bold text-lg">{invitation.isEquity ? `${invitation.equityPercentage}% Shareholder` : 'Profit Participant'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormGroup label="Choose Password" required>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                                            <input
                                                type="password"
                                                className="input-field pl-12 h-14"
                                                value={formData.password}
                                                onChange={e => handleChange('password', e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <p className="text-[10px] text-neutral-600 mt-2 uppercase tracking-widest font-bold">Min. 8 characters</p>
                                    </FormGroup>
                                    <FormGroup label="Confirm Password" required>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                                            <input
                                                type="password"
                                                className="input-field pl-12 h-14"
                                                value={formData.confirmPassword}
                                                onChange={e => handleChange('confirmPassword', e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormGroup label="Mobile Number" required>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                                            <input className="input-field pl-12 h-14" value={formData.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} placeholder="+1 234 567 890" />
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="Timezone">
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                                            <input className="input-field pl-12 h-14" value={formData.timezone} onChange={e => handleChange('timezone', e.target.value)} />
                                        </div>
                                    </FormGroup>
                                </div>
                                <FormGroup label="Permanent Address">
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-neutral-600" />
                                        <textarea rows={3} className="input-field pl-12 pt-4 min-h-[120px]" value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="Full street address..." />
                                    </div>
                                </FormGroup>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div className="p-8 bg-neutral-950/50 border border-neutral-800 rounded-[2rem] space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormGroup label="Bank Name / Holder">
                                            <input className="input-field h-14" value={formData.bankAccountName} onChange={e => handleChange('bankAccountName', e.target.value)} />
                                        </FormGroup>
                                        <FormGroup label="Account Number">
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                                                <input className="input-field pl-12 h-14" value={formData.bankAccountNumber} onChange={e => handleChange('bankAccountNumber', e.target.value)} />
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="IFSC / SWIFT">
                                            <input className="input-field h-14 uppercase" value={formData.ifscSwift} onChange={e => handleChange('ifscSwift', e.target.value.toUpperCase())} />
                                        </FormGroup>
                                        <FormGroup label="Tax ID / PAN">
                                            <input className="input-field h-14 uppercase" value={formData.taxIdPan} onChange={e => handleChange('taxIdPan', e.target.value.toUpperCase())} />
                                        </FormGroup>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                <div className="p-8 bg-indigo-600/5 border border-indigo-600/10 rounded-[2.5rem] space-y-6">
                                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                        <ClipboardCheck className="w-8 h-8 text-indigo-500" />
                                        Final Confirmation
                                    </h3>
                                    <p className="text-neutral-400 leading-relaxed text-sm">
                                        I hereby acknowledge that I have read and agree to the <strong>Master Partnership Agreement (v1.2)</strong>.
                                        I understand that my contributions, profit share, and IP assignment will be governed by these terms.
                                    </p>

                                    <div className="pt-6 space-y-6">
                                        <label className="flex items-center gap-4 p-5 bg-black/40 border border-neutral-800 rounded-3xl cursor-pointer hover:border-indigo-500/50 transition-all group">
                                            <input
                                                type="checkbox"
                                                className="w-6 h-6 rounded-lg border-neutral-700 bg-neutral-800 text-indigo-600 focus:ring-indigo-500"
                                                checked={formData.agreementAccepted}
                                                onChange={e => handleChange('agreementAccepted', e.target.checked)}
                                            />
                                            <span className="text-white font-bold group-hover:text-indigo-400 transition-colors">I accept the Terms & Conditions</span>
                                        </label>

                                        <FormGroup label="Type Full Name for Digital Signature">
                                            <div className="relative">
                                                <Signature className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-600" />
                                                <input
                                                    className="input-field pl-14 h-16 font-signature text-3xl text-indigo-400 bg-neutral-950/50"
                                                    value={formData.digitalSignature}
                                                    onChange={e => handleChange('digitalSignature', e.target.value)}
                                                    placeholder="Your Signature"
                                                />
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={step === 0 || submitting}
                        className={`px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-800 hover:text-white transition-all flex items-center gap-2 ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ChevronLeft className="w-5 h-5" /> Back
                    </button>

                    <div className="flex gap-4">
                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="px-10 py-4 bg-indigo-600 rounded-2xl text-white font-black hover:bg-indigo-500 shadow-xl shadow-indigo-900/30 active:scale-95 transition-all flex items-center gap-2"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubmit()}
                                disabled={submitting || !formData.agreementAccepted || !formData.digitalSignature}
                                className="px-10 py-4 bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-black hover:bg-emerald-500 shadow-xl shadow-emerald-900/30 active:scale-95 transition-all flex items-center gap-3"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Activity className="w-6 h-6" /> Finalize My Profile</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormGroup({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500/80 flex items-center gap-2 px-1">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}
