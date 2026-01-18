"use client";

import React from "react";
import {
    ChevronRight,
    Eye,
    Check,
    RotateCcw,
    XOctagon,
    Send,
    PenTool,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    RiwayatSurat,
} from "@/components/features/detail-surat";
import Link from "next/link";
import { AdminActionModals } from "./AdminActionModals";
import { WD1SignatureModal } from "./WD1SignatureModal";
import { UPANumberingModal } from "./UPANumberingModal";
import { useState } from "react";
import Image from "next/image";
import { Hash, Sparkles } from "lucide-react";

interface AdminDetailSuratProps {
    role: "supervisor-akademik" | "manajer-tu" | "wakil-dekan-1" | "upa";
    id: string;
}

export function AdminDetailSurat({ role, id }: AdminDetailSuratProps) {
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: "approve" | "revise" | "reject" | "publish";
    }>({ isOpen: false, type: "approve" });
    const [wd1Signature, setWd1Signature] = useState<string | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [upaLetterNumber, setUpaLetterNumber] = useState("");
    const [upaIsStampApplied, setUpaIsStampApplied] = useState(false);
    const [isNumberingModalOpen, setIsNumberingModalOpen] = useState(false);

    const handleAction = (
        type: "approve" | "revise" | "reject" | "publish",
    ) => {
        setModalConfig({ isOpen: true, type });
    };

    const handleConfirmAction = (data: {
        reason?: string;
        targetRole?: string;
    }) => {
        console.log("Action Confirmed:", modalConfig.type, data, {
            wd1Signature,
            upaLetterNumber,
            upaIsStampApplied,
        });
        // Here you would typically call an API
    };

    const identitasData = {
        namaLengkap: "Ahmad Syaifullah",
        nimNip: "24060121120001",
        email: "ahmadsyaifullah@students.undip.ac.id",
        departemen: "Informatika",
        programStudi: "Informatika",
        tempatLahir: "Blora",
        tanggalLahir: "03/18/2006",
        noHp: "089123141241412412",
        ipk: "3.9",
        ips: "3.8",
        sks: "100",
    };

    const detailSuratData = {
        jenisSurat: "SRB/ Surat Rekomendasi Beasiswa",
        keperluan: "Beasiswa Djarum Foundation",
    };

    const breadcrumbs = {
        "supervisor-akademik": ["Surat Masuk", "Penerima", "Identitas Pemohon"],
        "manajer-tu": ["Surat Masuk", "Penerima", "Identitas Pemohon"],
        "wakil-dekan-1": [
            "Surat Masuk",
            "Persetujuan",
            "Detail Penandatanganan",
        ],
        upa: ["Surat Masuk", "Penomoran", "Detail Publikasi"],
    };

    const currentBreadcrumb = breadcrumbs[role] || [
        "Persuratan",
        "Detail Surat",
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <AdminActionModals
                isOpen={modalConfig.isOpen}
                onClose={() =>
                    setModalConfig({ ...modalConfig, isOpen: false })
                }
                onConfirm={handleConfirmAction}
                type={modalConfig.type}
                role={role}
            />
            <WD1SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onSignatureChange={setWd1Signature}
            />
            <UPANumberingModal
                isOpen={isNumberingModalOpen}
                onClose={() => setIsNumberingModalOpen(false)}
                onNumberChange={setUpaLetterNumber}
                onStampApply={setUpaIsStampApplied}
            />
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                {currentBreadcrumb.map((crumb, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
                        <span
                            className={
                                index === currentBreadcrumb.length - 1
                                    ? "text-slate-800"
                                    : ""
                            }
                        >
                            {crumb}
                        </span>
                    </React.Fragment>
                ))}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Identitas Pengaju */}
                    <IdentitasPengaju data={identitasData as any} />

                    {/* Detail Surat Pengajuan */}
                    <DetailSuratPengajuan data={detailSuratData as any} />

                    {/* Lampiran Section */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            Lampiran
                        </h2>
                        <div className="space-y-4">
                            {/* KTM Attachment */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-800">
                                            KTM
                                        </span>
                                        <span className="text-slate-400 text-sm">
                                            - KTM_24060121120001.jpg
                                        </span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
                                </button>
                                <div className="px-6 pb-6 pt-6">
                                    <div className="w-full bg-[#6A8E7F] rounded-lg p-12 flex items-center justify-center overflow-hidden">
                                        <div className="bg-white shadow-xl max-w-sm w-full aspect-3/4 p-8 flex flex-col items-center justify-center relative border border-gray-100">
                                            {/* Stack of paper effect */}
                                            <div className="absolute top-2 left-2 right-2 bottom-2 border border-gray-100 -z-10 bg-white shadow-sm transform rotate-1"></div>
                                            <div className="absolute top-1 left-1 right-1 bottom-1 border border-gray-100 -z-20 bg-white shadow-sm transform -rotate-1"></div>

                                            <div className="w-16 h-20 border-2 border-gray-200 rounded flex flex-col gap-2 p-2">
                                                <div className="h-2 bg-gray-100 w-full"></div>
                                                <div className="h-2 bg-gray-100 w-3/4"></div>
                                                <div className="h-2 bg-gray-100 w-full"></div>
                                            </div>
                                            <p className="mt-4 text-[10px] text-slate-400 font-medium">
                                                SIMULASI DOKUMEN
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KHS Attachment */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-800">
                                            Transkrip
                                        </span>
                                        <span className="text-slate-400 text-sm">
                                            - Transkrip_Nilai_Semester_6.pdf
                                        </span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
                                </button>
                                <div className="px-6 pb-6 pt-6">
                                    <div className="w-full bg-[#6A8E7F] rounded-lg p-12 flex items-center justify-center overflow-hidden">
                                        <div className="bg-white shadow-xl max-w-sm w-full aspect-3/4 p-8 flex flex-col items-center justify-center relative border border-gray-100">
                                            <div className="absolute top-2 left-2 right-2 bottom-2 border border-gray-100 -z-10 bg-white shadow-sm transform rotate-1"></div>
                                            <div className="absolute top-1 left-1 right-1 bottom-1 border border-gray-100 -z-20 bg-white shadow-sm transform -rotate-1"></div>

                                            <div className="w-16 h-20 border-2 border-gray-200 rounded flex flex-col gap-2 p-2 font-serif text-[6px] text-gray-400 overflow-hidden leading-tight">
                                                LOREM IPSUM DOLOR SIT AMET
                                                CONSECTETUR ADIPISCING ELIT SED
                                                DO EIUSMOD TEMPOR INCIDIDUNT UT
                                                LABORE ET DOLORE MAGNA ALIQUA...
                                            </div>
                                            <p className="mt-4 text-[10px] text-slate-400 font-medium">
                                                SIMULASI DOKUMEN
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Aksi Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">
                            Aksi
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href={`/mahasiswa/surat/proses/preview/${id}?stage=${
                                    role === "supervisor-akademik"
                                        ? "supervisor"
                                        : role === "manajer-tu"
                                          ? "manajer"
                                          : role === "wakil-dekan-1"
                                            ? "wd1"
                                            : "upa"
                                }${upaLetterNumber ? `&no=${encodeURIComponent(upaLetterNumber)}` : ""}`}
                            >
                                <Button className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2 mb-3">
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </Button>
                            </Link>

                            {role !== "upa" ? (
                                <>
                                    {role === "wakil-dekan-1" && (
                                        <div className="space-y-3 mb-3">
                                            <Button
                                                onClick={() =>
                                                    setIsSignatureModalOpen(
                                                        true,
                                                    )
                                                }
                                                className="w-full bg-white border-2 border-undip-blue text-undip-blue hover:bg-blue-50 font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <PenTool className="h-5 w-5" />
                                                {wd1Signature
                                                    ? "Ubah Tanda Tangan"
                                                    : "Tandatangani"}
                                            </Button>

                                            {wd1Signature && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center animate-in zoom-in duration-300">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                                                        Tanda Tangan Terpilih
                                                    </p>
                                                    <div className="bg-white rounded-lg p-2 border border-slate-100 shadow-sm relative w-32 h-16">
                                                        <Image
                                                            src={wd1Signature}
                                                            alt="Signature Preview"
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleAction("approve")}
                                        disabled={
                                            role === "wakil-dekan-1" &&
                                            !wd1Signature
                                        }
                                        className={`w-full ${role === "wakil-dekan-1" && !wd1Signature ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-undip-blue hover:bg-sky-700 text-white"} font-bold py-6 rounded-lg flex items-center justify-center gap-2`}
                                    >
                                        <Check className="h-5 w-5" />
                                        Setujui
                                    </Button>
                                    <Button
                                        onClick={() => handleAction("revise")}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                        Revisi
                                    </Button>
                                    <Button
                                        onClick={() => handleAction("reject")}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <XOctagon className="h-5 w-5" />
                                        Tolak
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-3">
                                        <Button
                                            onClick={() =>
                                                setIsNumberingModalOpen(true)
                                            }
                                            className="w-full bg-white border-2 border-undip-blue text-undip-blue hover:bg-blue-50 font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <Hash className="h-5 w-5" />
                                            {upaLetterNumber
                                                ? "Ubah No. Surat"
                                                : "Beri Nomor Surat"}
                                        </Button>

                                        <Button
                                            onClick={() =>
                                                setUpaIsStampApplied(
                                                    !upaIsStampApplied,
                                                )
                                            }
                                            className={`w-full ${upaIsStampApplied ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" : "bg-white border-2 border-undip-blue text-undip-blue hover:bg-blue-50"} font-bold py-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm`}
                                        >
                                            <ShieldCheck className="h-5 w-5" />
                                            {upaIsStampApplied
                                                ? "Hapus Stempel"
                                                : "Bubuhkan Stempel"}
                                        </Button>

                                        {(upaLetterNumber ||
                                            upaIsStampApplied) && (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in zoom-in duration-300">
                                                {upaLetterNumber && (
                                                    <div className="flex flex-col items-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest text-center">
                                                            Nomor Surat Terpilih
                                                        </p>
                                                        <div className="flex items-center gap-2 text-undip-blue font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-50 w-full justify-center">
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                            {upaLetterNumber}
                                                        </div>
                                                    </div>
                                                )}

                                                {upaIsStampApplied && (
                                                    <div className="flex items-center gap-2 justify-center py-1 border-t border-slate-100 pt-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest text-center">
                                                            Stempel Digital
                                                            Aktif
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => handleAction("publish")}
                                        disabled={
                                            !upaLetterNumber ||
                                            !upaIsStampApplied
                                        }
                                        className={`w-full ${!upaLetterNumber || !upaIsStampApplied ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-undip-blue hover:bg-sky-700 text-white shadow-lg"} font-bold py-6 rounded-lg flex items-center justify-center gap-2`}
                                    >
                                        <Send className="h-5 w-5" />
                                        Publish
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <RiwayatSurat
                        riwayat={[
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Mahasiswa",
                                status: "Surat Diajukan",
                                date: "08 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
