"use client";

import {
    ChevronLeft,
    Minus,
    Plus,
    Maximize2,
    Minimize2,
    Info,
    Hash,
    Send,
    ShieldCheck,
    Check,
    PenTool,
    RotateCcw,
    XOctagon,
    Download,
} from "lucide-react";
import {
    verifyApplication,
    getLetterConfig,
    LeadershipConfig,
} from "@/lib/application-api";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { SuratDocument } from "@/components/features/surat-rekomendasi-beasiswa/preview/SuratDocument";
import { UPANumberingModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/UPANumberingModal";
import { WD1SignatureModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/WD1SignatureModal";
import { AdminActionModals } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/AdminActionModals";
import { SuccessStampModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/SuccessStampModal";
import { ActionStatusModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/ActionStatusModal";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export interface PreviewData {
    nama?: string;
    nim?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    noHp?: string;
    jurusan?: string;
    programStudi?: string;
    semester?: string;
    ipk?: string;
    ips?: string;
    keperluan?: string;
    email?: string;
    status?: string;
    currentStep?: number;
    applicationId?: string;
    signatureUrl?: string;
    nomorSurat?: string;
    publishedAt?: string;
    qrCodeUrl?: string;
}

interface SuratPreviewContentProps {
    defaultStage?: string;
    backUrl?: string;
    data?: PreviewData;
    applicationId?: string;
}

export function SuratPreviewContent({
    defaultStage = "mahasiswa",
    backUrl,
    data,
    applicationId,
}: SuratPreviewContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stage = searchParams.get("stage") || defaultStage;

    const [upaLetterNumber, setUpaLetterNumber] = useState(
        searchParams.get("no") || data?.nomorSurat || "",
    );
    const [upaIsStampApplied, setUpaIsStampApplied] = useState(
        !!(searchParams.get("no") || data?.nomorSurat),
    );
    const [wd1Signature, setWd1Signature] = useState<string | null>(
        data?.signatureUrl || null,
    );
    const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(
        data?.qrCodeUrl,
    );
    const [isNumberingModalOpen, setIsNumberingModalOpen] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [modalType, setModalType] = useState<
        "approve" | "revise" | "reject" | "publish"
    >("approve");
    const [isSuccessStampModalOpen, setIsSuccessStampModalOpen] =
        useState(false);
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        status: "success" | "error";
        type: "approve" | "revise" | "reject" | "publish";
        message?: string;
    }>({ isOpen: false, status: "success", type: "approve" });
    const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [leadershipConfig, setLeadershipConfig] =
        useState<LeadershipConfig | null>(null);

    useEffect(() => {
        if (searchParams.get("autoPrint") === "true") {
            const timer = setTimeout(() => {
                window.print();
            }, 1000); // Small delay to ensure rendering is complete
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Fetch leadership config on mount
    useEffect(() => {
        const fetchLeadershipConfig = async () => {
            const config = await getLetterConfig("WAKIL_DEKAN_1");
            if (config) {
                setLeadershipConfig(config);
            }
        };
        fetchLeadershipConfig();
    }, []);

    // Map stage to step number for canTakeAction logic
    const stageStepMap: Record<string, number> = {
        supervisor: 1,
        manajer: 2,
        wd1: 3,
        upa: 4,
    };
    const roleStep = stageStepMap[stage] || 0;
    const currentStep = data?.currentStep || 0;
    const isTerminalStatus =
        data?.status === "COMPLETED" ||
        data?.status === "PUBLISHED" ||
        data?.status === "REJECTED";

    // Can only take action if:
    // 1. The application is at this role's step
    // 2. The application is not in a terminal status (COMPLETED/REJECTED)
    const canTakeAction = currentStep === roleStep && !isTerminalStatus;

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
    const resetZoom = () => setZoom(100);

    const handleBack = () => {
        if (backUrl) {
            router.push(backUrl);
        } else {
            router.back();
        }
    };

    const config = useMemo(() => {
        // SINGLE SOURCE OF TRUTH LOGIC:
        // Use the actual data state (wd1Signature, upaLetterNumber) to decide what to render.
        // The 'stage' prop primarily controls the SIDEBAR actions/context, not the document content visibility.
        // Exception: If we are in 'wd1' stage (approval process), we show the signature being drafted (local state) or existing one.

        const hasSignature = !!wd1Signature;
        const hasStamp = upaIsStampApplied;
        const hasLetterNumber = !!upaLetterNumber;

        return {
            showSignature: hasSignature,
            signaturePath: wd1Signature || "/assets/signature-dummy.png", // Only used if showSignature is true
            showStamp: hasStamp,
            nomorSurat: hasLetterNumber ? upaLetterNumber : "",
            data: data,
            leadershipConfig: leadershipConfig || undefined,
            qrCodeUrl: qrCodeUrl,
        };
    }, [
        upaLetterNumber,
        upaIsStampApplied,
        wd1Signature,
        data,
        leadershipConfig,
        qrCodeUrl,
    ]);

    const attributes = [
        {
            label: "Status Saat Ini",
            value: (() => {
                if (
                    data?.status === "COMPLETED" ||
                    data?.status === "PUBLISHED"
                )
                    return "Selesai / Terbit";
                if (data?.status === "REJECTED") return "Ditolak";
                if (data?.status === "REVISED") return "Perlu Revisi";

                const stepLabels: Record<number, string> = {
                    1: "SUPERVISOR AKADEMIK",
                    2: "MANAJER TU",
                    3: "WAKIL DEKAN 1",
                    4: "UPA",
                };

                const pendingRole = stepLabels[currentStep] || "PROSES";
                return `Menunggu Verifikasi (${pendingRole})`;
            })(),
        },
        { label: "Jenis Surat", value: "Surat Rekomendasi Beasiswa" },
        {
            label: "Keperluan",
            value: data?.keperluan || "-",
        },
        { label: "Nama Lengkap", value: data?.nama || "-" },
        { label: "Role", value: "Mahasiswa" },
        { label: "NIM", value: data?.nim || "-" },
        {
            label: "Email",
            value: data?.email || "-",
        },
        { label: "Departemen", value: data?.jurusan || "-" },
        { label: "Program Studi", value: data?.programStudi || "-" },
        { label: "Tempat Lahir", value: data?.tempatLahir || "-" },
        {
            label: "Tanggal Lahir",
            value: data?.tanggalLahir || "-",
        },
        { label: "No. HP", value: data?.noHp || "-" },
        { label: "Semester", value: data?.semester || "-" },
        { label: "IPK", value: data?.ipk || "-" },
        { label: "IPS", value: data?.ips || "-" },
    ];

    return (
        <div className="h-full flex overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page { 
                        margin: 0; 
                        size: A4 portrait;
                    }
                    /* Hide browser headers/footers by clearing page margin */
                    html, body {
                        margin: 0;
                        height: 100%;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `,
                }}
            />
            <UPANumberingModal
                isOpen={isNumberingModalOpen}
                onClose={() => setIsNumberingModalOpen(false)}
                onNumberChange={setUpaLetterNumber}
                onStampApply={() => {}} // Stamp is always true in this UI
                applicationId={applicationId}
                onVerificationGenerated={(data) => {
                    if (data.qrImage) {
                        setQrCodeUrl(data.qrImage);
                    }
                }}
            />
            <SuccessStampModal
                isOpen={isSuccessStampModalOpen}
                onClose={() => setIsSuccessStampModalOpen(false)}
            />
            <ActionStatusModal
                isOpen={statusModal.isOpen}
                onClose={() => {
                    setStatusModal((prev) => ({ ...prev, isOpen: false }));
                    if (statusModal.status === "success" && pendingRedirect) {
                        router.push(pendingRedirect);
                    }
                }}
                status={statusModal.status}
                type={statusModal.type}
                customMessage={statusModal.message}
            />
            <WD1SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onSignatureChange={setWd1Signature}
            />
            <AdminActionModals
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                type={modalType}
                role={
                    (stage === "supervisor"
                        ? "supervisor-akademik"
                        : stage === "manajer"
                          ? "manajer-tu"
                          : stage === "wd1"
                            ? "wakil-dekan-1"
                            : "upa") as
                        | "supervisor-akademik"
                        | "manajer-tu"
                        | "wakil-dekan-1"
                        | "upa"
                }
                onConfirm={async (data) => {
                    try {
                        const messages: Record<string, string> = {
                            approve: "Surat Berhasil Disetujui!",
                            revise: `Revisi diminta ke ${data.targetRole}. Alasan: ${data.reason}`,
                            reject: `Surat Berhasil Ditolak. Alasan: ${data.reason}`,
                            publish: "Surat Berhasil Diterbitkan!",
                        };

                        let redirectPath = "";
                        if (stage === "supervisor") {
                            redirectPath =
                                "/supervisor-akademik/surat/perlu-tindakan";
                        } else if (stage === "manajer") {
                            redirectPath = "/manajer-tu/surat/perlu-tindakan";
                        } else if (stage === "wd1") {
                            redirectPath =
                                "/wakil-dekan-1/surat/perlu-tindakan";
                        } else if (stage === "upa") {
                            redirectPath = "/upa/surat/perlu-tindakan";
                        }

                        // Map targetRole to Step (Step 0 = Mahasiswa, 1 = Supervisor, 2 = TU, 3 = WD1)
                        const roleToStep: Record<string, number> = {
                            Mahasiswa: 0,
                            "Supervisor Akademik": 1,
                            "Manajer TU": 2,
                            "Wakil Dekan 1": 3,
                        };

                        const action =
                            modalType === "publish" ? "approve" : modalType;

                        await verifyApplication(applicationId || "", {
                            action:
                                action === "revise"
                                    ? "revision"
                                    : (action as
                                          | "approve"
                                          | "reject"
                                          | "revision"),
                            notes: data.reason,
                            targetStep: data.targetRole
                                ? roleToStep[data.targetRole]
                                : undefined,
                            signatureUrl: wd1Signature || undefined,
                            letterNumber: upaLetterNumber || undefined,
                        });

                        setPendingRedirect(redirectPath);
                        setStatusModal({
                            isOpen: true,
                            status: "success",
                            type: modalType,
                            message: messages[modalType],
                        });
                    } catch (error) {
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : "Gagal memproses pengajuan.";
                        setStatusModal({
                            isOpen: true,
                            status: "error",
                            type: modalType,
                            message: errorMessage,
                        });
                    }
                }}
            />
            {/* Left Sidebar: Attributes */}
            <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto hidden xl:block shrink-0 print:hidden">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Preview
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Pratinjau surat untuk tahap {stage}. Periksa detail
                            sebelum melanjutkan proses.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden text-center">
                        <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Info className="h-4 w-4 text-slate-400" />
                            <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
                                Atribut Surat
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 text-left">
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
                <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm print:hidden">
                    {/* <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                            Pratinjau Surat
                        </span>
                    </div> */}

                    <div className="flex items-center gap-4 bg-slate-100 rounded-lg px-2 py-1">
                        <button
                            onClick={handleZoomOut}
                            className="p-1 hover:bg-white rounded shadow-sm transition-all duration-200"
                        >
                            <Minus className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                            onClick={resetZoom}
                            className="text-xs font-bold text-slate-700 px-3 border-x border-slate-200 hover:text-undip-blue"
                        >
                            {zoom}%
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-1 hover:bg-white rounded shadow-sm transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 text-slate-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Halaman 1/1
                        </span>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors group"
                            title={isFullscreen ? "Minimize" : "Maximize"}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4 text-slate-400 group-hover:text-undip-blue transition-colors" />
                            ) : (
                                <Maximize2 className="h-4 w-4 text-slate-400 group-hover:text-undip-blue transition-colors" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Document Area */}
                <div className="flex-1 overflow-auto p-12 flex justify-center bg-[#F1F5F9] print:bg-white print:p-0 print:block print:overflow-visible">
                    <div
                        className="origin-top transition-transform duration-300 shadow-2xl print:shadow-none print:transform-none print:fixed print:top-0 print:left-0 print:z-9999 print:w-screen print:h-auto print:bg-white"
                        style={{ transform: `scale(${zoom / 100})` }}
                    >
                        <SuratDocument {...config} />
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Actions */}
            <div
                className={`${isFullscreen ? "w-0 opacity-0 overflow-hidden" : "w-80"} border-l border-gray-200 bg-white overflow-y-auto hidden md:block transition-all duration-500 ease-in-out print:hidden`}
            >
                <div className="p-6 space-y-6">
                    {/* Show status message if action is not allowed */}
                    {!canTakeAction && stage !== "mahasiswa" ? (
                        <div className="space-y-4">
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                    Status
                                </h2>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                    Informasi Surat
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
                                <div
                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${isTerminalStatus ? (data?.status === "COMPLETED" ? "bg-emerald-100" : "bg-red-100") : "bg-undip-blue/10"}`}
                                >
                                    {isTerminalStatus ? (
                                        data?.status === "COMPLETED" ? (
                                            <Check className="h-6 w-6 text-emerald-600" />
                                        ) : (
                                            <XOctagon className="h-6 w-6 text-red-600" />
                                        )
                                    ) : (
                                        <Check className="h-6 w-6 text-undip-blue" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">
                                        {isTerminalStatus
                                            ? data?.status === "COMPLETED"
                                                ? "Surat Selesai"
                                                : "Surat Ditolak"
                                            : "Sudah Diproses"}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {isTerminalStatus
                                            ? `Status akhir: ${data?.status === "COMPLETED" ? "Terbit" : "Ditolak"}`
                                            : `Surat ini sudah Anda proses dan telah diteruskan ke tahap berikutnya.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : stage === "upa" ? (
                        <>
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                    Penerbitan
                                </h2>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                    Finalisasi Dokumen
                                </p>
                            </div>

                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-undip-blue">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                                            Otoritas UPA
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                            Tahap 1: Penomoran
                                        </p>
                                        <Button
                                            onClick={() =>
                                                setIsNumberingModalOpen(true)
                                            }
                                            className={`w-full ${upaLetterNumber ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"} border-2 font-bold py-5 rounded-xl flex items-center justify-center gap-2 text-[11px] shadow-sm transition-all`}
                                        >
                                            <Hash className="h-4 w-4" />
                                            {upaLetterNumber
                                                ? "Ubah No. Surat"
                                                : "Isi No. Surat"}
                                            {upaLetterNumber && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </Button>

                                        {upaLetterNumber && (
                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 animate-in zoom-in duration-300">
                                                <div className="bg-white border border-emerald-100 rounded-lg py-2 px-3 text-center shadow-inner">
                                                    <span className="text-[10px] font-bold text-emerald-700 font-mono tracking-tight">
                                                        {upaLetterNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 pt-5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                            Tahap 2: Pengesahan
                                        </p>
                                        <Button
                                            onClick={() => {
                                                const nextValue =
                                                    !upaIsStampApplied;
                                                setUpaIsStampApplied(nextValue);
                                                if (nextValue) {
                                                    setIsSuccessStampModalOpen(
                                                        true,
                                                    );
                                                }
                                            }}
                                            className={`w-full ${upaIsStampApplied ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"} border-2 font-bold py-5 rounded-xl flex items-center justify-center gap-2 text-[11px] shadow-sm transition-all`}
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            {upaIsStampApplied
                                                ? "Hapus Stempel"
                                                : "Bubuhkan Stempel"}
                                            {upaIsStampApplied && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </Button>

                                        {upaIsStampApplied && (
                                            <div className="flex items-center gap-2 justify-center py-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                                    Stempel On-Board
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 pt-5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                                            Langkah Terakhir
                                        </p>
                                        <Button
                                            disabled={
                                                !upaLetterNumber ||
                                                !upaIsStampApplied
                                            }
                                            className={`w-full ${!upaLetterNumber || !upaIsStampApplied ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-undip-blue hover:bg-sky-700 text-white"} font-bold py-6 rounded-lg flex items-center justify-center gap-2`}
                                            onClick={() => {
                                                setModalType("publish");
                                                setIsActionModalOpen(true);
                                            }}
                                        >
                                            <Send className="h-5 w-5" />
                                            Publish & Terbitkan
                                        </Button>
                                        {(!upaLetterNumber ||
                                            !upaIsStampApplied) && (
                                            <p className="text-[9px] text-slate-400 text-center leading-tight">
                                                Nomor dan stempel wajib diisi
                                                sebelum publikasi.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : stage === "wd1" ? (
                        <>
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                    Persetujuan
                                </h2>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                    Otorisasi Dokumen
                                </p>
                            </div>

                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-undip-blue">
                                            <PenTool className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                                            Wakil Dekan 1
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                            Langkah 1: Tanda Tangan
                                        </p>
                                        <Button
                                            onClick={() =>
                                                setIsSignatureModalOpen(true)
                                            }
                                            className={`w-full ${wd1Signature ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"} border-2 font-bold py-5 rounded-xl flex items-center justify-center gap-2 text-[11px] shadow-sm transition-all`}
                                        >
                                            <PenTool className="h-4 w-4" />
                                            {wd1Signature
                                                ? "Ubah Tanda Tangan"
                                                : "Bubuhkan Tanda Tangan"}
                                            {wd1Signature && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </Button>

                                        {wd1Signature && (
                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 animate-in zoom-in duration-300">
                                                <div className="bg-white border border-emerald-100 rounded-lg py-2 px-3 flex justify-center shadow-inner pt-2">
                                                    <div className="relative w-32 h-16">
                                                        <Image
                                                            src={wd1Signature}
                                                            alt="WD1 Signature"
                                                            fill
                                                            className="object-contain mix-blend-multiply"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 pt-5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                                            Langkah Terakhir
                                        </p>
                                        <Button
                                            disabled={!wd1Signature}
                                            className={`w-full ${!wd1Signature ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-undip-blue hover:bg-sky-700 text-white"} font-bold py-6 rounded-lg flex items-center justify-center gap-2`}
                                            onClick={() => {
                                                setModalType("approve");
                                                setIsActionModalOpen(true);
                                            }}
                                        >
                                            <Check className="h-5 w-5" />
                                            Setujui
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setModalType("revise");
                                                setIsActionModalOpen(true);
                                            }}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="h-5 w-5" />
                                            Revisi
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setModalType("reject");
                                                setIsActionModalOpen(true);
                                            }}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <XOctagon className="h-5 w-5" />
                                            Tolak
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : stage === "supervisor" || stage === "manajer" ? (
                        <>
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                    {stage === "supervisor"
                                        ? "Verifikasi"
                                        : "Persetujuan"}
                                </h2>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                    {stage === "supervisor"
                                        ? "Supervisor Akademik"
                                        : "Manajer TU"}
                                </p>
                            </div>

                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-undip-blue">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                                            Otoritas {stage.toUpperCase()}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 pt-5 border-t border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                                            Pilih Tindakan
                                        </p>

                                        <Button
                                            onClick={() => {
                                                setModalType("approve");
                                                setIsActionModalOpen(true);
                                            }}
                                            className="w-full bg-undip-blue hover:bg-sky-700 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <Check className="h-5 w-5" />
                                            Setujui
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setModalType("revise");
                                                setIsActionModalOpen(true);
                                            }}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="h-5 w-5" />
                                            Revisi
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setModalType("reject");
                                                setIsActionModalOpen(true);
                                            }}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <XOctagon className="h-5 w-5" />
                                            Tolak
                                        </Button>
                                        <p className="text-[9px] text-slate-400 text-center leading-tight pt-2">
                                            Tindakan ini akan mempengaruhi
                                            status surat pengaju secara
                                            langsung.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : stage === "mahasiswa" ? (
                        <>
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                    Unduh Surat
                                </h2>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                    Pratinjau & Cetak
                                </p>
                            </div>

                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                            <Download className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                                            Dokumen Siap
                                        </h3>
                                    </div>

                                    <div className="space-y-3 pt-5 border-t border-slate-100 text-center">
                                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                            Klik tombol di bawah untuk mencetak
                                            atau mengunduh surat sebagai PDF.
                                        </p>
                                        <Button
                                            onClick={() => {
                                                if (
                                                    typeof window !==
                                                    "undefined"
                                                ) {
                                                    window.print();
                                                }
                                            }}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                        >
                                            <Download className="h-5 w-5" />
                                            Unduh PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                                Informasi
                            </h2>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                Status Dokumen
                            </p>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="pt-2">
                        <Button
                            onClick={handleBack}
                            variant="outline"
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-6 rounded-lg flex items-center justify-center gap-2 border-none shadow-sm transition-all active:scale-95"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Kembali
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
