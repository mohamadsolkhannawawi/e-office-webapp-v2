"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, XCircle, RotateCcw, Send, AlertTriangle } from "lucide-react";

import { WorkflowRole } from "@/types/detail-surat";

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        reason?: string;
        targetRole?: WorkflowRole | string;
    }) => void;
    type: "approve" | "revise" | "reject" | "publish";
    role: "supervisor-akademik" | "manajer-tu" | "wakil-dekan-1" | "upa";
    data?: {
        nomorSurat?: string;
    };
}

export function AdminActionModals({
    isOpen,
    onClose,
    onConfirm,
    type,
    role,
    data,
}: ActionModalProps) {
    const getRevisionRoles = () => {
        switch (role) {
            case "manajer-tu":
                return [
                    { value: "Mahasiswa", label: "Mahasiswa (Pengaju)" },
                    {
                        value: "Supervisor Akademik",
                        label: "Supervisor Akademik",
                    },
                ];
            case "wakil-dekan-1":
                return [
                    { value: "Mahasiswa", label: "Mahasiswa (Pengaju)" },
                    {
                        value: "Supervisor Akademik",
                        label: "Supervisor Akademik",
                    },
                    { value: "Manajer TU", label: "Manajer TU" },
                ];
            default:
                // Supervisor Akademik can only revise to Mahasiswa
                return [{ value: "Mahasiswa", label: "Mahasiswa (Pengaju)" }];
        }
    };

    const [reason, setReason] = useState("");
    const [targetRole, setTargetRole] = useState(getRevisionRoles()[0].value);

    const handleConfirm = () => {
        onConfirm({ reason, targetRole });
        setReason("");
        setTargetRole(getRevisionRoles()[0].value);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125 rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-4">
                            <div
                                className={`p-3 rounded-3xl ${
                                    type === "approve" || type === "publish"
                                        ? "bg-blue-50 text-undip-blue"
                                        : type === "revise"
                                          ? "bg-orange-50 text-orange-500"
                                          : "bg-red-50 text-red-600"
                                }`}
                            >
                                {type === "approve" && (
                                    <Check className="h-6 w-6" />
                                )}
                                {type === "publish" && (
                                    <Send className="h-6 w-6" />
                                )}
                                {type === "revise" && (
                                    <RotateCcw className="h-6 w-6" />
                                )}
                                {type === "reject" && (
                                    <XCircle className="h-6 w-6" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold text-slate-800">
                                    {type === "approve" && "Setujui Dokumen"}
                                    {type === "publish" && "Publish Dokumen"}
                                    {type === "revise" && "Minta Revisi"}
                                    {type === "reject" && "Tolak Pengajuan"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 mt-1">
                                    {type === "approve" &&
                                        "Lanjutkan dokumen ke tahapan berikutnya."}
                                    {type === "publish" &&
                                        "Nomor surat akan dibubuhkan secara otomatis."}
                                    {type === "revise" &&
                                        "Berikan instruksi revisi yang jelas untuk pengaju."}
                                    {type === "reject" &&
                                        "Tindakan ini tidak dapat dibatalkan."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {type === "revise" && (
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    Tujukan Revisi Ke
                                </Label>
                                <Select
                                    onValueChange={setTargetRole}
                                    defaultValue={getRevisionRoles()[0].value}
                                >
                                    <SelectTrigger className="h-12 rounded-3xl border-slate-200">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getRevisionRoles().map((r) => (
                                            <SelectItem
                                                key={r.value}
                                                value={r.value}
                                            >
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(type === "revise" || type === "reject") && (
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    Alasan{" "}
                                    {type === "revise" ? "Revisi" : "Penolakan"}
                                </Label>
                                <Textarea
                                    className="min-h-30 rounded-3xl border-slate-200 focus:ring-undip-blue resize-none"
                                    placeholder={`Tuliskan alasan ${type === "revise" ? "revisi" : "penolakan"} Anda di sini...`}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Informasi ini akan dikirimkan sebagai
                                    notifikasi kepada pengaju.
                                </p>
                            </div>
                        )}

                        {type === "publish" && (
                            <div className="space-y-5">
                                {/* Header - Nama Surat */}
                                <div className="border-l-4 border-undip-blue pl-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Dokumen yang Akan Diterbitkan
                                    </p>
                                    <p className="text-lg font-bold text-slate-800 mt-1">
                                        Surat Rekomendasi Beasiswa
                                    </p>
                                </div>

                                {/* Nomor Surat */}
                                <div className="bg-linear-to-br from-blue-50 to-blue-50/30 p-5 rounded-3xl border border-blue-200/50">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
                                        Nomor Surat
                                    </p>
                                    <p className="text-2xl font-bold text-undip-blue font-mono">
                                        {data?.nomorSurat || "---"}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-3 leading-relaxed">
                                        Format: [Nomor]/UN7.F8.1/KM/[Bulan]/
                                        {new Date().getFullYear()}
                                    </p>
                                </div>

                                {/* Status Publikasi */}
                                <div className="bg-linear-to-br from-green-50 to-green-50/30 p-5 rounded-3xl border border-green-200/50">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-green-800">
                                                Dokumen akan dipublikasikan
                                            </p>
                                            <p className="text-xs text-green-700 mt-2 leading-relaxed">
                                                Setelah publikasi, mahasiswa
                                                akan dapat mengunduh surat ini
                                                dari portal akademik.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-8 gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-3xl font-bold border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={`flex-1 h-12 rounded-3xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                                type === "approve" || type === "publish"
                                    ? "bg-undip-blue hover:bg-sky-700 shadow-blue-100"
                                    : type === "revise"
                                      ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100"
                                      : "bg-red-600 hover:bg-red-700 shadow-red-100"
                            }`}
                        >
                            Konfirmasi{" "}
                            {type === "approve"
                                ? "Setujui"
                                : type === "publish"
                                  ? "Publish"
                                  : type === "revise"
                                    ? "Revisi"
                                    : "Tolak"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
