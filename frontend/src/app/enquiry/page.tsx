"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, Loader2, Briefcase, ChevronRight, ChevronLeft, User, LayoutDashboard, FileText } from 'lucide-react';
import { PROJECT_SERVICES } from '@/lib/project-types';

const STEPS = [
    { id: 1, title: 'Contact', icon: User },
    { id: 2, title: 'Project Scope', icon: LayoutDashboard },
    { id: 3, title: 'Details', icon: FileText },
];

export default function PublicEnquiryForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        clientName: '',
        companyName: '',
        email: '',
        phone: '',
        country: '',
        servicesRequested: [] as string[],
        projectDescription: '',
        timeline: '',
        budgetRange: '',
        discoverySource: '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            servicesRequested: prev.servicesRequested.includes(service)
                ? prev.servicesRequested.filter(s => s !== service)
                : [...prev.servicesRequested, service]
        }));
    };

    const handleNext = () => {
        setError('');
        if (currentStep === 1) {
            if (!formData.clientName || !formData.email) {
                setError('Please fill in your Name and Email.');
                return;
            }
        }
        if (currentStep === 2) {
            if (formData.servicesRequested.length === 0) {
                setError('Please select at least one service.');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrev = () => {
        setError('');
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.projectDescription) {
            setError('Please provide a brief project description.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/enquiries`, formData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred while submitting your enquiry.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Enquiry Received!</h2>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                        Thank you for reaching out. Our team will review your requirements and get back to you shortly.
                    </p>
                    <button
                        onClick={() => { setSuccess(false); setCurrentStep(1); setFormData({ clientName: '', companyName: '', email: '', phone: '', country: '', servicesRequested: [], projectDescription: '', timeline: '', budgetRange: '', discoverySource: '' }); }}
                        className="w-full px-6 py-4 bg-white hover:bg-neutral-100 text-black font-semibold rounded-xl text-lg transition-colors"
                    >
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto w-full">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-6">
                        Project Kickoff
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Let's build something <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">great.</span>
                    </h1>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                        Tell us a bit about yourself and your project so we can hit the ground running.
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-center max-w-2xl mx-auto">
                        {STEPS.map((step, index) => {
                            const isCompleted = currentStep > step.id;
                            const isCurrent = currentStep === step.id;
                            const StepIcon = step.icon;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center relative z-10 w-24">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${isCompleted ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/30' : isCurrent ? 'bg-neutral-900 border-indigo-500' : 'bg-neutral-900 border-neutral-800'}`}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <StepIcon className={`w-5 h-5 ${isCurrent ? 'text-indigo-400' : 'text-neutral-500'}`} />}
                                        </div>
                                        <div className={`mt-3 text-sm font-medium transition-colors ${isCurrent || isCompleted ? 'text-white' : 'text-neutral-500'}`}>
                                            {step.title}
                                        </div>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-4 max-w-[100px] bg-neutral-800 relative">
                                            <div className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                {error}
                            </div>
                        )}

                        {/* STEP 1: CONTACT */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-8 border-b border-neutral-800 pb-4">
                                    <h3 className="text-xl font-semibold text-white">Your Contact Details</h3>
                                    <p className="text-neutral-400 text-sm mt-1">How can we reach you?</p>
                                </div>
                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                                    <div>
                                        <label htmlFor="clientName" className="block text-sm font-medium text-neutral-300">Full Name *</label>
                                        <input
                                            type="text"
                                            id="clientName"
                                            value={formData.clientName}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300">Email Address *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-neutral-300">Company Name</label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-neutral-300">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: SCOPE */}
                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="border-b border-neutral-800 pb-4">
                                    <h3 className="text-xl font-semibold text-white">Project Scope</h3>
                                    <p className="text-neutral-400 text-sm mt-1">What kind of services do you need?</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-4">Select all that apply *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.values(PROJECT_SERVICES).flat().map((service) => {
                                            const isSelected = formData.servicesRequested.includes(service);
                                            return (
                                                <div
                                                    key={service}
                                                    onClick={() => toggleService(service)}
                                                    className={`cursor-pointer rounded-xl p-4 flex items-center gap-4 transition-all duration-200 border ${isSelected
                                                        ? 'bg-indigo-600/10 border-indigo-500 shadow-sm shadow-indigo-500/10'
                                                        : 'bg-black/40 border-neutral-800 hover:border-neutral-600 hover:bg-black/60'
                                                        }`}
                                                >
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    <div className={`font-medium text-sm leading-tight ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                                                        {service}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                                    <div>
                                        <label htmlFor="discoverySource" className="block text-sm font-medium text-neutral-300">How did you hear about us?</label>
                                        <select
                                            id="discoverySource"
                                            value={formData.discoverySource}
                                            onChange={(e) => setFormData({ ...formData, discoverySource: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Google Search">Google Search</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Referral">Referral / Word of Mouth</option>
                                            <option value="Clutch / Review Site">Clutch / Review Site</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DETAILS */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-8 border-b border-neutral-800 pb-4">
                                    <h3 className="text-xl font-semibold text-white">Project Details</h3>
                                    <p className="text-neutral-400 text-sm mt-1">Briefly tell us what you have in mind.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="timeline" className="block text-sm font-medium text-neutral-300">Target Start Date</label>
                                        <select
                                            id="timeline"
                                            value={formData.timeline}
                                            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        >
                                            <option value="">Select a timeframe</option>
                                            <option value="Immediately">Immediately</option>
                                            <option value="1-2 Weeks">1-2 Weeks</option>
                                            <option value="1 Month">1 Month</option>
                                            <option value="3+ Months">3+ Months</option>
                                            <option value="Just exploring">Just exploring</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="budgetRange" className="block text-sm font-medium text-neutral-300">Estimated Budget</label>
                                        <select
                                            id="budgetRange"
                                            value={formData.budgetRange}
                                            onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                                            className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        >
                                            <option value="">Select a range</option>
                                            <option value="Under $5,000">Under $5k</option>
                                            <option value="$5,000 - $10,000">$5k - $10k</option>
                                            <option value="$10,000 - $25,000">$10k - $25k</option>
                                            <option value="$25,000+">$25k+</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="projectDescription" className="block text-sm font-medium text-neutral-300">Brief Project Description *</label>
                                    <textarea
                                        id="projectDescription"
                                        rows={5}
                                        value={formData.projectDescription}
                                        onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                                        className="mt-2 block w-full rounded-xl bg-black/50 border border-neutral-800 px-4 py-4 text-white placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
                                        placeholder="Tell us a little bit about what you're looking to achieve... Once submitted, we will send you a tailored discovery form based on your services."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="mt-12 pt-6 border-t border-neutral-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentStep === 1 || loading}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'} disabled:opacity-50`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl font-semibold transition-colors"
                                >
                                    Next Step
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Complete Enquiry
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
