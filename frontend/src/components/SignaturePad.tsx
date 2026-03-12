"use client";

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw, Check, X } from 'lucide-react';

interface SignaturePadProps {
    onSave: (signature: string) => void;
    onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert("Please provide a signature first.");
            return;
        }
        const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
        if (signatureData) {
            onSave(signatureData);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 transition-all">
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Digital Signature</h3>
                        <p className="text-xs text-neutral-500">Draw your signature below</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-white rounded-xl overflow-hidden border-2 border-neutral-800 shadow-inner">
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{
                                width: 400,
                                height: 200,
                                className: 'signature-canvas w-full h-[200px] cursor-crosshair'
                            }}
                        />
                    </div>
                    <div className="bg-neutral-800/20 rounded-xl p-4 mt-4 border border-neutral-800/50">
                        <p className="text-[10px] text-neutral-400 leading-relaxed">
                            <span className="text-indigo-400 font-bold uppercase tracking-wider block mb-1">Legal Notice</span>
                            By providing your digital signature, you acknowledge that this is a legally binding agreement between you and the agency, equivalent to a traditional ink signature on paper.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-neutral-950/50 border-t border-neutral-800 flex items-center justify-between gap-4">
                    <button
                        onClick={clear}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                    <div className="flex gap-3">
                         <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={save}
                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <Check className="w-4 h-4" /> Finalize
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
