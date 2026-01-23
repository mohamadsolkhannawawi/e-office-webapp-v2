"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { UPANumberingSection } from "./UPANumberingSection";

interface UPANumberingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNumberChange: (number: string) => void;
    onStampApply: (applied: boolean) => void;
    applicationId?: string;
    onVerificationGenerated?: (data: {
        code: string;
        verifyUrl: string;
        qrImage: string;
    }) => void;
}

export function UPANumberingModal({
    isOpen,
    onClose,
    onNumberChange,
    onStampApply,
    applicationId,
    onVerificationGenerated,
}: UPANumberingModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Penomoran & Stempel Digital</DialogTitle>
                    <DialogDescription>
                        Formulir untuk mengisi nomor surat dan pembubuhan
                        stempel digital.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-10 relative bg-white">
                    <UPANumberingSection
                        onNumberChange={onNumberChange}
                        onStampApply={onStampApply}
                        applicationId={applicationId}
                        onVerificationGenerated={onVerificationGenerated}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
