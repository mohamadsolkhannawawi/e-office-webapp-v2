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
import { XCircle, AlertCircle, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: "success" | "error";
    type: "approve" | "revise" | "reject" | "publish";
    customMessage?: string;
}

export function ActionStatusModal({
    isOpen,
    onClose,
    status,
    type,
    customMessage,
}: ActionStatusModalProps) {
    const isSuccess = status === "success";

    const getContent = () => {
        if (isSuccess) {
            switch (type) {
                case "approve":
                    return {
                        title: "Berhasil Disetujui!",
                        description:
                            customMessage ||
                            "Dokumen telah berhasil disetujui dan diteruskan ke otoritas berikutnya.",
                        icon: <Check className="h-12 w-12" />,
                        bgColor: "bg-emerald-50",
                        iconColor: "text-emerald-600",
                        pingColor: "bg-emerald-100",
                    };
                case "publish":
                    return {
                        title: "Berhasil Dipublikasi!",
                        description:
                            customMessage ||
                            "Dokumen telah diterbitkan secara resmi dan nomor surat telah dibubuhkan.",
                        icon: <Send className="h-12 w-12" />,
                        bgColor: "bg-blue-50",
                        iconColor: "text-undip-blue",
                        pingColor: "bg-blue-100",
                    };
                case "revise":
                    return {
                        title: "Permintaan Revisi Terkirim!",
                        description:
                            customMessage ||
                            "Instruksi revisi telah berhasil dikirimkan kembali ke pengaju.",
                        icon: <AlertCircle className="h-12 w-12" />,
                        bgColor: "bg-orange-50",
                        iconColor: "text-orange-600",
                        pingColor: "bg-orange-100",
                    };
                case "reject":
                    return {
                        title: "Pengajuan Ditolak",
                        description:
                            customMessage ||
                            "Dokumen telah ditolak dan pengaju akan mendapatkan notifikasi.",
                        icon: <XCircle className="h-12 w-12" />,
                        bgColor: "bg-slate-50",
                        iconColor: "text-slate-600",
                        pingColor: "bg-slate-100",
                    };
            }
        } else {
            return {
                title: "Gagal Memproses",
                description:
                    customMessage ||
                    "Terjadi kesalahan teknis saat memproses tindakan Anda. Silakan coba beberapa saat lagi.",
                icon: <XCircle className="h-12 w-12" />,
                bgColor: "bg-red-50",
                iconColor: "text-red-600",
                pingColor: "bg-red-100",
            };
        }
    };

    const content = getContent();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-100 rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div
                                className={cn(
                                    "absolute inset-0 rounded-full animate-ping opacity-25",
                                    content.pingColor,
                                )}
                            ></div>
                            <div
                                className={cn(
                                    "relative p-5 rounded-full shadow-inner",
                                    content.bgColor,
                                    content.iconColor,
                                )}
                            >
                                {content.icon}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                {content.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 leading-relaxed font-medium">
                                {content.description}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <Button
                        onClick={onClose}
                        className={cn(
                            "w-full text-white font-bold h-12 rounded-3xl shadow-lg transition-all active:scale-95",
                            isSuccess
                                ? "bg-undip-blue hover:bg-sky-700 shadow-blue-100"
                                : "bg-red-600 hover:bg-red-700 shadow-red-100",
                        )}
                    >
                        {isSuccess ? "Lanjutkan" : "Tutup"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
