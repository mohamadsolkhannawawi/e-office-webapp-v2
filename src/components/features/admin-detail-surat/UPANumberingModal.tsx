"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UPANumberingSection } from "./UPANumberingSection";

interface UPANumberingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNumberChange: (number: string) => void;
    onStampApply: (applied: boolean) => void;
}

export function UPANumberingModal({
    isOpen,
    onClose,
    onNumberChange,
    onStampApply,
}: UPANumberingModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-10 relative bg-white">
                    <UPANumberingSection
                        onNumberChange={onNumberChange}
                        onStampApply={onStampApply}
                    />
                    <div className="absolute top-6 right-8">
                        <button
                            onClick={onClose}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
                        >
                            <span className="sr-only">Tutup</span>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
