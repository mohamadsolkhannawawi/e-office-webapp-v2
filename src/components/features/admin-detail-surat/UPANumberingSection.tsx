"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Sparkles, Check, Info, ShieldCheck } from "lucide-react";

interface UPANumberingSectionProps {
    onNumberChange: (number: string) => void;
    onStampApply: (applied: boolean) => void;
}

export function UPANumberingSection({
    onNumberChange,
    onStampApply,
}: UPANumberingSectionProps) {
    const [letterNumber, setLetterNumber] = useState("");

    const generateNumber = () => {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generated = `${randomNum}/UN7.F5/KM/${year}`;
        setLetterNumber(generated);
        onNumberChange(generated);
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
                    Penomoran & Stempel Digital
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
                                className="h-8 text-undip-blue hover:text-sky-700 hover:bg-blue-50 gap-1.5 font-bold text-xs"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Generate Otomatis
                            </Button>
                        </div>
                        <div className="relative group">
                            <Input
                                value={letterNumber}
                                onChange={handleNumberChange}
                                placeholder="Klik generate atau isi manual (Contoh: 1234/UN7.F5/KM/2026)"
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

                    {/* Stamp Configuration */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between bg-slate-50/80 p-5 rounded-2xl border border-slate-100 ring-1 ring-white/50 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <div className="w-10 h-10 border-4 border-undip-blue/20 rounded-full flex items-center justify-center relative">
                                        <div className="w-6 h-6 border-2 border-undip-blue/40 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-undip-blue/60 rounded-full"></div>
                                        </div>
                                        <div className="absolute -top-1 -right-1 bg-undip-blue text-white rounded-full p-0.5 shadow-sm">
                                            <Check className="h-2 w-2" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">
                                        Stempel Digital Aktif
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Stempel resmi Fakultas otomatis
                                        dibubuhkan saat Publish.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                    Ready to Seal
                                </span>
                            </div>
                        </div>
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
                        sidebar, surat akan dikunci, nomor dan stempel akan
                        dibubuhkan secara permanen, dan status akan berubah
                        menjadi <strong>Selesai (Publikasi)</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
