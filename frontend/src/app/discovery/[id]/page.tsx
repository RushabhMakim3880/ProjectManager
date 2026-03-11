"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { DISCOVERY_SCHEMA, GENERAL_DISCOVERY_FIELDS, ServiceDiscoveryConfig, DiscoveryField } from '@/lib/discovery-schema';

interface EnquiryData {
    enquiryId: string;
    clientName: string;
    servicesRequested: string[];
    stage: string;
    id: string;
}

export default function DiscoveryFormPage() {
    const params = useParams();
    const [enquiry, setEnquiry] = useState<EnquiryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [currentStep, setCurrentStep] = useState(0);

    // Determine which schema sections apply based on services
    const [activeSections, setActiveSections] = useState<ServiceDiscoveryConfig[]>([]);

    useEffect(() => {
        const fetchEnquiry = async () => {
            if (!params || !params.id) return;
            try {
                // Determine ID from URL: /discovery/ENQ-2026-001 -> lookup by enquiryId
                // Wait, we need an endpoint to fetch by enquiryId for public viewing.
                // Since this is public, we'll create a new public route in backend to get basic enquiry details OR just fetch by ID if we change backend.
                // For now, let's assume we fetch all and filter, or we modify the backend next. Let's make an API call to a specific public endpoint.
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/public/${params.id}`);
                setEnquiry(res.data);

                // Match services to schema
                const matchedSections = DISCOVERY_SCHEMA.filter(section =>
                    res.data.servicesRequested.some((service: string) =>
                        section.keywords.some(kw => service.toLowerCase().includes(kw.toLowerCase()))
                    )
                );
                setActiveSections(matchedSections);
            } catch (err) {
                setError('Invalid or expired Discovery Link.');
            } finally {
                setLoading(false);
            }
        };

        if (params && params.id) {
            fetchEnquiry();
        }
    }, [params]);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
        setFormData(prev => {
            const current = prev[fieldId] || [];
            if (checked) {
                return { ...prev, [fieldId]: [...current, option] };
            } else {
                return { ...prev, [fieldId]: current.filter((o: string) => o !== option) };
            }
        });
    };



    const renderField = (field: DiscoveryField) => {
        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        className="mt-2 block w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        required={field.required}
                        placeholder={field.placeholder}
                        rows={4}
                        value={formData[field.id] || ''}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        className="mt-2 block w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                );
            case 'select':
                return (
                    <select
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        className="mt-2 block w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="" disabled>Select an option</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="mt-3 space-y-2">
                        {field.options?.map(opt => (
                            <label key={opt} className="flex items-center text-neutral-300">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={opt}
                                    required={field.required}
                                    checked={formData[field.id] === opt}
                                    onChange={e => handleInputChange(field.id, e.target.value)}
                                    className="mr-3 text-indigo-500 focus:ring-indigo-500 bg-neutral-900 border-neutral-700"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                );
            case 'multiselect':
                return (
                    <div className="mt-3 space-y-2">
                        {field.options?.map(opt => {
                            const isChecked = (formData[field.id] || []).includes(opt);
                            return (
                                <label key={opt} className="flex items-center text-neutral-300">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={e => handleCheckboxChange(field.id, opt, e.target.checked)}
                                        className="mr-3 rounded text-indigo-500 focus:ring-indigo-500 bg-neutral-900 border-neutral-700"
                                    />
                                    {opt}
                                </label>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !enquiry) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
                    <p className="text-red-400/80">{error}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Discovery Form Submitted</h2>
                    <p className="text-neutral-400">
                        Thank you, {enquiry.clientName}. We have successfully received your project requirements.
                        Our team will review this data and follow up with a detailed proposal.
                    </p>
                </div>
            </div>
        );
    }

    const totalSteps = 1 + activeSections.length;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const isLastStep = currentStep === totalSteps - 1;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLastStep) {
            handleNext();
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/enquiries/public/${enquiry?.id}/discovery`, {
                discoveryData: formData
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit discovery form.');
        } finally {
            setSubmitting(false);
        }
    };

    const currentSectionTitle = currentStep === 0 ? "General Information" : activeSections[currentStep - 1]?.title;
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 py-12">
            <div className="max-w-3xl w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Project Discovery</h1>
                    <p className="text-neutral-400 text-lg">
                        Welcome {enquiry.clientName}, let's scope out your project details.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {enquiry.servicesRequested.map((srv, idx) => (
                            <span key={idx} className="bg-indigo-500/10 text-indigo-400 text-sm px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-sm shadow-indigo-500/10">
                                {srv}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Wizard Container */}
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 shadow-2xl rounded-3xl overflow-hidden">

                    {/* Progress Bar Header */}
                    <div className="bg-neutral-900 border-b border-neutral-800 px-8 py-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/30">
                                    {currentStep + 1}
                                </span>
                                {currentSectionTitle}
                            </h2>
                            <span className="text-neutral-500 text-sm font-medium">Step {currentStep + 1} of {totalSteps}</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <form onSubmit={onSubmit} className="p-8">

                        {/* Step Content */}
                        <div className="min-h-[300px] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <p className="text-neutral-400 mb-6">General information about your project goals and budget.</p>
                                    {GENERAL_DISCOVERY_FIELDS.map(field => (
                                        <div key={field.id} className="group">
                                            <label className="block text-sm font-medium text-neutral-300 mb-1 group-focus-within:text-indigo-400 transition-colors">
                                                {field.label} {field.required && <span className="text-rose-500">*</span>}
                                            </label>
                                            {field.helpText && <p className="text-xs text-neutral-500 mb-2">{field.helpText}</p>}
                                            {renderField(field)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep > 0 && activeSections[currentStep - 1] && (
                                <div className="space-y-6">
                                    <p className="text-neutral-400 mb-6">{activeSections[currentStep - 1].description}</p>
                                    {activeSections[currentStep - 1].fields.map(field => (
                                        <div key={field.id} className="group">
                                            <label className="block text-sm font-medium text-neutral-300 mb-1 group-focus-within:text-indigo-400 transition-colors">
                                                {field.label} {field.required && <span className="text-rose-500">*</span>}
                                            </label>
                                            {field.helpText && <p className="text-xs text-neutral-500 mb-2">{field.helpText}</p>}
                                            {renderField(field)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center gap-4 pt-6 border-t border-neutral-800">
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-3 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-xl transition-all font-medium flex-1 sm:flex-none flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/25 border border-indigo-500 text-white font-medium rounded-xl transition-all flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        {isLastStep ? 'Complete Discovery' : 'Next Step'}
                                        {isLastStep ? <CheckCircle2 className="w-5 h-5 ml-1" /> : <ChevronRight className="w-5 h-5 ml-1" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
