"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { UPAStampSection } from "./UPAStampSection";

interface UPAStampModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStampChange: (
        data: { stampId: string; stampUrl: string | null } | null,
    ) => void;
    applicationId: string;
    appliedStampId?: string | null;
}

export function UPAStampModal({
    isOpen,
    onClose,
    onStampChange,
    applicationId,
    appliedStampId,
}: UPAStampModalProps) {
    const handleStampChange = (
        data: { stampId: string; stampUrl: string | null } | null,
    ) => {
        onStampChange(data);
        // Auto close modal on successful save
        if (data) {
            setTimeout(() => onClose(), 500);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl w-full max-w-[95%] rounded-2xl border-none shadow-lg p-4 sm:p-8 overflow-hidden overflow-y-auto max-h-[90vh]">
                <DialogHeader className="sr-only">
                    <DialogTitle className="text-base sm:text-lg font-semibold">
                        Stempel Digital
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Lakukan pembubuhan stempel digital pada dokumen.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 sm:p-6 relative bg-white">
                    <UPAStampSection
                        applicationId={applicationId}
                        onStampChange={handleStampChange}
                        appliedStampId={appliedStampId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
