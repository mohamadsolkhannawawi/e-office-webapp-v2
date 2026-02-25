"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PencilLine, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MahasiswaEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    jenis?: string;
    scholarshipName?: string;
}

/**
 * Modal konfirmasi untuk mahasiswa yang ingin mengedit surat yang sudah diajukan
 * namun belum mendapat tindakan dari Supervisor Akademik.
 *
 * Setelah konfirmasi, user diarahkan ke halaman form dengan mode=student_edit.
 */
export function MahasiswaEditModal({
    isOpen,
    onClose,
    applicationId,
    jenis = "internal",
    scholarshipName,
}: MahasiswaEditModalProps) {
    const router = useRouter();

    const handleConfirm = () => {
        onClose();
        router.push(
            `/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${applicationId}&mode=student_edit`,
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-3xl bg-amber-50 text-amber-600 shrink-0">
                                <PencilLine className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-800">
                                    Edit Surat Sebelum Diproses
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 mt-1 text-sm">
                                    Anda dapat mengedit data surat selama belum
                                    diproses oleh Supervisor Akademik.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                            <div className="space-y-1.5">
                                <p className="text-sm font-semibold text-amber-800">
                                    Perhatian
                                </p>
                                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                                    <li>
                                        Perubahan akan dicatat dalam riwayat
                                        surat sebagai{" "}
                                        <span className="font-semibold">
                                            &ldquo;Revisi oleh Mahasiswa&rdquo;
                                        </span>
                                    </li>
                                    <li>
                                        Setelah diedit, surat tetap menunggu
                                        verifikasi{" "}
                                        <span className="font-semibold">
                                            Supervisor Akademik
                                        </span>
                                    </li>
                                    <li>
                                        Semua role dapat melihat riwayat ini
                                        ketika surat sampai ke tahap mereka
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {scholarshipName && (
                        <div className="bg-slate-50 rounded-2xl p-3 mb-6 text-sm">
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">
                                Surat yang akan diedit
                            </p>
                            <p className="font-semibold text-slate-800">
                                {scholarshipName}
                            </p>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="rounded-3xl border-slate-200 text-slate-600 hover:bg-slate-50 flex-1 order-2 sm:order-1"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex-1 order-1 sm:order-2"
                        >
                            <PencilLine className="h-4 w-4 mr-2" />
                            Ya, Edit Surat
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
