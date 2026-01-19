"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface SuccessStampModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SuccessStampModal({ isOpen, onClose }: SuccessStampModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
                            <div className="relative bg-emerald-50 p-5 rounded-full text-emerald-600 shadow-inner">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-emerald-50">
                                <ShieldCheck className="h-5 w-5 text-undip-blue" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                Stempel Dibubuhkan!
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                                Stempel resmi Fakultas Sains dan Matematika
                                telah berhasil dibubuhkan pada dokumen ini.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <Button
                        onClick={onClose}
                        className="w-full bg-undip-blue hover:bg-sky-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        Lanjutkan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
