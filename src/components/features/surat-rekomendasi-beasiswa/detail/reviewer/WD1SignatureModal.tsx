"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { WD1SignatureSection } from "./WD1SignatureSection";

interface WD1SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignatureChange: (signature: string | null) => void;
}

export function WD1SignatureModal({
    isOpen,
    onClose,
    onSignatureChange,
}: WD1SignatureModalProps) {
    const [selectedSignature, setSelectedSignature] = useState<string | null>(
        null,
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSignatureChange = (signature: string | null) => {
        setSelectedSignature(signature);
    };

    const handleSave = async () => {
        if (!selectedSignature) {
            return;
        }

        setIsSaving(true);
        try {
            onSignatureChange(selectedSignature);
            setTimeout(() => {
                onClose();
                setSelectedSignature(null);
            }, 600);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl w-full max-w-[95%] rounded-2xl border-none shadow-lg p-4 sm:p-8 overflow-hidden overflow-y-auto max-h-[90vh]">
                <DialogHeader className="sr-only">
                    <DialogTitle className="text-base sm:text-lg font-semibold">
                        Tanda Tangan Digital
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Lakukan pembubuhan tanda tangan digital pada dokumen.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 sm:p-6 relative bg-white">
                    <WD1SignatureSection
                        onSignatureChange={handleSignatureChange}
                    />
                </div>

                <div className="flex gap-3 px-4 sm:px-8 pb-4 sm:pb-8 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold border-slate-300 text-slate-600 hover:bg-slate-50 mt-4"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedSignature || isSaving}
                        className="flex-1 h-12 rounded-xl font-bold text-white bg-undip-blue hover:bg-sky-700 shadow-lg shadow-blue-100 transition-all active:scale-95 mt-4"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Check className="h-5 w-5" />
                                Simpan Tanda Tangan
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
