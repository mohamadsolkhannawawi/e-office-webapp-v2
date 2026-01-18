"use client";

import { ChevronLeft, Minus, Plus, Maximize2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { SuratDocument } from "@/components/features/preview-surat/SuratDocument";
import React, { useMemo } from "react";

export default function SuratPreviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stage = searchParams.get("stage") || "mahasiswa";

    const handleBack = () => {
        router.back();
    };

    const config = useMemo(() => {
        switch (stage) {
            case "mahasiswa":
            case "supervisor":
            case "manajer":
                return {
                    showSignature: false,
                    showStamp: false,
                    nomorSurat: "",
                };
            case "wd1":
                return {
                    showSignature: true,
                    showStamp: false,
                    nomorSurat: "",
                };
            case "upa":
            case "selesai":
                return {
                    showSignature: true,
                    showStamp: true,
                    nomorSurat: "1234/UN7.F8.1/KM/2026",
                };
            default:
                return {
                    showSignature: false,
                    showStamp: false,
                    nomorSurat: "",
                };
        }
    }, [stage]);

    const attributes = [
        {
            label: "Status Saat Ini",
            value:
                stage === "selesai"
                    ? "Selesai / Terbit"
                    : `Menunggu Verifikasi (${stage.toUpperCase()})`,
        },
        { label: "Jenis Surat", value: "Surat Rekomendasi Beasiswa" },
        { label: "Keperluan", value: "Beasiswa Djarum Foundation" },
        { label: "Nama", value: "Ahmad Syaifullah" },
        { label: "NIM", value: "24060121120001" },
        { label: "Email", value: "ahmadsyaifullah@students.undip.ac.id" },
        { label: "Tempat Lahir", value: "Blora" },
        { label: "Tanggal Lahir", value: "18 Maret 2006" },
        { label: "No. HP", value: "0812321312312" },
        { label: "Semester", value: "8" },
        { label: "Departemen", value: "Informatika" },
        { label: "IPK", value: "3.34" },
        { label: "IPS", value: "3.34" },
    ];

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden">
            {/* Left Sidebar: Attributes */}
            <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto hidden md:block">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Preview
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed lowercase">
                            Pratinjau surat untuk tahap {stage}. Periksa detail
                            sebelum melanjutkan proses.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Info className="h-4 w-4 text-slate-400" />
                            <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
                                Atribut Surat
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {attributes.map((attr, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase">
                                        {attr.label}
                                    </p>
                                    <p
                                        className={`text-sm font-semibold ${attr.label === "Status Saat Ini" ? "text-undip-blue" : "text-slate-700"}`}
                                    >
                                        {attr.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Document Preview */}
            <div className="flex-1 flex flex-col bg-slate-200 overflow-hidden relative">
                {/* Toolbar */}
                <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                            Pratinjau Surat
                        </span>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-100 rounded-lg px-2 py-1">
                        <button className="p-1 hover:bg-white rounded shadow-sm transition-all duration-200">
                            <Minus className="h-4 w-4 text-slate-600" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 px-3 border-x border-slate-200">
                            100%
                        </span>
                        <button className="p-1 hover:bg-white rounded shadow-sm transition-all duration-200">
                            <Plus className="h-4 w-4 text-slate-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Halaman 1/1
                        </span>
                        <Maximize2 className="h-4 w-4 text-slate-400 cursor-pointer hover:text-undip-blue transition-colors" />
                    </div>
                </div>

                {/* Document Area */}
                <div className="flex-1 overflow-auto p-12 flex justify-center bg-[#F1F5F9]">
                    <div className="transform scale-95 origin-top transition-transform duration-300">
                        <SuratDocument {...config} />
                    </div>
                </div>

                {/* Floating Footer Back Button */}
                <div className="absolute bottom-10 right-10 flex justify-end gap-4">
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        className="bg-white/90 backdrop-blur-md hover:bg-white border-none px-8 py-6 h-14 shadow-xl font-bold text-slate-700 rounded-2xl transition-all hover:scale-105 active:scale-95 flex gap-2 items-center"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    );
}
