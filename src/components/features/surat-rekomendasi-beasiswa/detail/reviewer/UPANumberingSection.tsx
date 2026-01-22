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
import { previewLetterNumber } from "@/lib/application-api";

interface UPANumberingSectionProps {
    onNumberChange: (number: string) => void;
    onStampApply: (applied: boolean) => void;
    applicationId?: string;
    onVerificationGenerated?: (data: {
        code: string;
        verifyUrl: string;
        qrImage: string;
    }) => void;
}

export function UPANumberingSection({
    onNumberChange,
    onStampApply,
    applicationId,
    onVerificationGenerated,
}: UPANumberingSectionProps) {
    const [letterNumber, setLetterNumber] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-fetch preview number on mount
    useEffect(() => {
        const fetchPreview = async () => {
            setIsGenerating(true);
            const number = await previewLetterNumber("SRB");
            if (number) {
                setLetterNumber(number);
                onNumberChange(number);
            }
            setIsGenerating(false);
        };
        fetchPreview();
    }, [onNumberChange]);

    // Re-fetch preview number manually (or generate real one if implemented fully)
    const generateNumber = async () => {
        setIsGenerating(true);
        // If we have applicationId, we generate real number with verification
        if (applicationId) {
            const result = await import("@/lib/application-api").then((m) =>
                m.generateLetterNumber("SRB", applicationId),
            );
            if (result) {
                setLetterNumber(result.letterNumber);
                onNumberChange(result.letterNumber);
                if (result.verification && onVerificationGenerated) {
                    onVerificationGenerated(result.verification);
                }
            }
        } else {
            // Preview only
            const number = await previewLetterNumber("SRB");
            if (number) {
                setLetterNumber(number);
                onNumberChange(number);
            }
        }
        setIsGenerating(false);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLetterNumber(e.target.value);
        onNumberChange(e.target.value);
    };

    useEffect(() => {
        // Default stamp to true
        onStampApply(true);
    }, [onStampApply]);

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
                                onClick={generateNumber}
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
