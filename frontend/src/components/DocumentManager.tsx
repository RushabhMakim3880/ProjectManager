"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Upload,
    Download,
    Trash2,
    File,
    FileCode,
    Image as ImageIcon,
    FileArchive,
    Search,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Document {
    id: string;
    name: string;
    fileKey: string;
    mimeType: string;
    size: number;
    createdAt: string;
    uploadedBy: {
        name: string;
    };
}

interface DocumentManagerProps {
    projectId: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ projectId }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${projectId}/documents`);
            setDocuments(res.data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [projectId]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    };

    const handleFileUpload = async (files: FileList | File[]) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file); // Use 'files' plural to match backend expectation
        });

        try {
            setUploading(true);
            await api.post(`/projects/${projectId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchDocuments();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload documents. Only PDF and Images are allowed (max 50MB per file).");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const response = await api.get(`/projects/documents/${doc.id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await api.delete(`/projects/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-400" />;
        if (mimeType.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
        if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <File className="w-5 h-5 text-emerald-400" />;
        return <File className="w-5 h-5 text-neutral-400" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Upload Document
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,image/*"
                    multiple
                />
            </div>

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative min-h-[400px] rounded-2xl border-2 border-dashed transition-all ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-neutral-800 bg-neutral-900/30'
                    }`}
            >
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : filteredDocs.length > 0 ? (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredDocs.map((doc) => (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-neutral-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                            {getFileIcon(doc.mimeType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors" title={doc.name}>
                                                {doc.name}
                                            </h4>
                                            <p className="text-[11px] text-neutral-500 mt-0.5">
                                                {formatFileSize(doc.size)} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider font-semibold">
                                                By {doc.uploadedBy.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-neutral-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">
                            {searchTerm ? 'No matching documents' : 'No documents yet'}
                        </h3>
                        <p className="text-sm text-neutral-500 max-w-xs">
                            {searchTerm
                                ? `We couldn't find anything matching "${searchTerm}"`
                                : 'Drag and drop your project deliverables here or click the upload button.'}
                        </p>
                    </div>
                )}

                {dragActive && (
                    <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-sm pointer-events-none flex items-center justify-center">
                        <div className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-xl">
                            Drop to upload
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;
