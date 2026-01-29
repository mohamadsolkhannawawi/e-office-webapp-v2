"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl w-full max-w-[95%] sm:max-w-[600px] rounded-[16px] border-none shadow-lg p-4 sm:p-8 overflow-hidden overflow-y-auto max-h-[90vh]">
                <DialogHeader className="sr-only">
                    <DialogTitle className="text-base sm:text-lg font-semibold">Tanda Tangan Digital</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Lakukan pembubuhan tanda tangan digital pada dokumen.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 sm:p-6 relative bg-white">
                    <WD1SignatureSection
                        onSignatureChange={(sig) => {
                            onSignatureChange(sig);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
