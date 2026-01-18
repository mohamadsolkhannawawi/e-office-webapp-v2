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
                </div>
            </DialogContent>
        </Dialog>
    );
}
