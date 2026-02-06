"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Hash,
    Sparkles,
    Check,
    Info,
    ShieldCheck,
    Loader2,
} from "lucide-react";
import {
    previewLetterNumber,
    generateLetterNumber,
    saveLetterNumber,
} from "@/lib/application-api";
import { triggerDocxGeneration } from "@/lib/template-api";
import { toast } from "react-hot-toast";

interface UPANumberingSectionProps {
    onNumberChange: (number: string) => void;
    onNumberSave?: (number: string) => void;
    onStampApply: (applied: boolean) => void;
    applicationId?: string;
    onVerificationGenerated?: (data: {
        code: string;
        verifyUrl: string;
        qrImage: string;
    }) => void;
    appliedLetterNumber?: string;
    onDocumentRegenerate?: () => void;
}

export function UPANumberingSection({
    onNumberChange,
    onNumberSave,
    onStampApply,
    applicationId,
    onVerificationGenerated,
    appliedLetterNumber,
    onDocumentRegenerate,
}: UPANumberingSectionProps) {
    const [letterNumber, setLetterNumber] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with external prop change
    useEffect(() => {
        if (appliedLetterNumber) {
            setLetterNumber(appliedLetterNumber);
        }
    }, [appliedLetterNumber]);

    // Auto-fetch preview number on mount if needed
    useEffect(() => {
        const fetchPreview = async () => {
            // If we already have a number from props, don't fetch
            if (appliedLetterNumber) return;

            setIsGenerating(true);
            const number = await previewLetterNumber("SRB");
            if (number) {
                setLetterNumber(number);
            }
            setIsGenerating(false);
        };

        // Only run on mount
        fetchPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch preview number manually (or generate real one if implemented fully)
    const handleGenerateNumber = async () => {
        setIsGenerating(true);
        try {
            // If we have applicationId, we generate real number with verification
            if (applicationId) {
                const result = await generateLetterNumber("SRB", applicationId);
                if (result) {
                    setLetterNumber(result.letterNumber);
                    onNumberChange(result.letterNumber);
                    if (result.verification && onVerificationGenerated) {
                        onVerificationGenerated(result.verification);
                    }
                    toast.success(
                        "Nomor surat berhasil digenerate! Nomor siap digunakan",
                    );
                } else {
                    toast.error(
                        "Gagal generate nomor surat. Silakan coba lagi atau hubungi administrator",
                    );
                }
            } else {
                // Preview only
                const number = await previewLetterNumber("SRB");
                if (number) {
                    setLetterNumber(number);
                    onNumberChange(number);
                }
            }
        } catch (error) {
            console.error("Error generating number:", error);
            toast.error(
                "Terjadi kesalahan sistem saat generate nomor surat. Hubungi administrator",
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLetterNumber(e.target.value);
    };

    const handleSaveNumber = async () => {
        if (!letterNumber.trim()) {
            toast.error(
                "Nomor surat tidak boleh kosong! Silakan isi nomor surat terlebih dahulu",
            );
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Menyimpan nomor surat...");

        try {
            if (applicationId) {
                // Save letter number to database
                const saveResult = await saveLetterNumber(
                    applicationId,
                    letterNumber,
                );
                if (saveResult?.success) {
                    // Pass verification data if available
                    if (saveResult.verification && onVerificationGenerated) {
                        onVerificationGenerated(saveResult.verification);
                    }

                    toast.success(
                        "Nomor surat berhasil disimpan! Sedang membuat dokumen...",
                        {
                            id: toastId,
                        },
                    );

                    // Trigger document regeneration with new number
                    const genResult =
                        await triggerDocxGeneration(applicationId);
                    if (genResult.success) {
                        onNumberChange(letterNumber);
                        if (onNumberSave) {
                            onNumberSave(letterNumber);
                        }
                        // Trigger PDF refresh
                        if (onDocumentRegenerate) {
                            onDocumentRegenerate();
                        }
                        toast.success(
                            "Dokumen berhasil diperbarui dengan nomor surat! Silakan download dokumen",
                            {
                                id: toastId,
                            },
                        );
                    } else {
                        toast.error(
                            `Nomor surat tersimpan, namun terjadi kesalahan saat membuat dokumen: ${genResult.error}`,
                            {
                                id: toastId,
                            },
                        );
                        onNumberChange(letterNumber);
                        if (onNumberSave) {
                            onNumberSave(letterNumber);
                        }
                    }
                } else {
                    toast.error(
                        "Gagal menyimpan nomor surat. Silakan coba lagi",
                        {
                            id: toastId,
                        },
                    );
                }
            } else {
                onNumberChange(letterNumber);
                if (onNumberSave) {
                    onNumberSave(letterNumber);
                }
                toast.success(
                    "Nomor surat berhasil disimpan! Data telah tersimpan",
                    { id: toastId },
                );
            }
        } catch (error) {
            console.error("Save number error:", error);
            toast.error(
                "Terjadi kesalahan sistem saat menyimpan nomor surat. Hubungi administrator",
                {
                    id: toastId,
                },
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-undip-blue" />
                    Penomoran Dokumen
                </h2>
                <div className="flex items-center gap-2 text-undip-blue bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    <ShieldCheck className="h-3 w-3" />
                    Otoritas UPA
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-100">
                <CardContent className="p-8 space-y-8">
                    {/* Numbering Field */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                Nomor Surat
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGenerateNumber}
                                disabled={isGenerating}
                                className="h-8 text-undip-blue hover:text-sky-700 hover:bg-blue-50 gap-1.5 font-bold text-xs"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                )}
                                {isGenerating
                                    ? "Memuat..."
                                    : "Generate Otomatis"}
                            </Button>
                        </div>
                        <div className="relative group">
                            <Input
                                value={letterNumber}
                                onChange={handleNumberChange}
                                placeholder={`Contoh: 001/UN7.F8.1/KM/I/${new Date().getFullYear()}`}
                                className="h-14 rounded-2xl border-slate-200 focus:ring-undip-blue focus:border-undip-blue pl-12 text-lg font-medium text-slate-700 transition-all group-hover:border-slate-300"
                            />
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-undip-blue transition-colors" />
                            {letterNumber && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                            <Info className="h-3 w-3" />
                            Pastikan format nomor surat sesuai dengan standar
                            penomoran Fakultas Sains dan Matematika.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Button
                onClick={handleSaveNumber}
                disabled={!letterNumber || isSaving}
                className="w-full bg-undip-blue hover:bg-undip-blue/90 text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 text-base shadow-sm transition-all disabled:opacity-50"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    <>
                        <Check className="h-5 w-5" />
                        Simpan Nomor Surat
                    </>
                )}
            </Button>

            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="bg-white p-2 rounded-xl shadow-sm text-amber-600">
                    <Info className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h5 className="text-xs font-bold text-amber-900">
                        Konfirmasi Publikasi
                    </h5>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                        Setelah Anda menekan tombol <strong>Publish</strong> di
                        sidebar, surat akan dikunci, nomor akan dibubuhkan
                        secara permanen, dan status akan berubah menjadi{" "}
                        <strong>Selesai (Publikasi)</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
