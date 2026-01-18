"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
            <DialogContent className="sm:max-w-3xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-10 relative bg-white">
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
