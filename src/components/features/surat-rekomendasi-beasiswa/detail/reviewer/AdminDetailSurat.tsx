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
    IdentitasPengajuProps,
    DetailSuratPengajuanProps,
} from "@/components/features/surat-rekomendasi-beasiswa/detail/common";
import Link from "next/link";
import { AdminActionModals } from "./AdminActionModals";
import { WD1SignatureModal } from "./WD1SignatureModal";
import { UPANumberingModal } from "./UPANumberingModal";
import { ActionStatusModal } from "./ActionStatusModal";
import { useState } from "react";
import Image from "next/image";
import { Hash, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApplicationDetail } from "@/lib/application-api";

interface AdminDetailSuratProps {
    role: "supervisor-akademik" | "manajer-tu" | "wakil-dekan-1" | "upa";
    id: string;
    initialData?: ApplicationDetail & {
        history?: Array<{
            id: string;
            status: string;
            action: string;
            note?: string;
            createdAt: string;
            actor?: {
                name: string;
            };
        }>;
    };
}

export function AdminDetailSurat({
    role,
    id,
    initialData,
}: AdminDetailSuratProps) {
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: "approve" | "revise" | "reject" | "publish";
    }>({ isOpen: false, type: "approve" });
    const [wd1Signature, setWd1Signature] = useState<string | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [upaLetterNumber, setUpaLetterNumber] = useState("");
    const [upaIsStampApplied, setUpaIsStampApplied] = useState(false);
    const [isNumberingModalOpen, setIsNumberingModalOpen] = useState(false);
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        status: "success" | "error";
        type: "approve" | "revise" | "reject" | "publish";
        message?: string;
    }>({ isOpen: false, status: "success", type: "approve" });
    const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = (
        type: "approve" | "revise" | "reject" | "publish",
    ) => {
        setModalConfig({ isOpen: true, type });
    };

    const handleConfirmAction = (data: {
        reason?: string;
        targetRole?: string;
    }) => {
        const messages: Record<string, string> = {
            approve: "Surat Berhasil Disetujui!",
            revise: `Revisi diminta ke ${data.targetRole}. Alasan: ${data.reason}`,
            reject: `Surat Berhasil Ditolak. Alasan: ${data.reason}`,
            publish: "Surat Berhasil Dipublikasikan!",
        };

        let redirectPath = "";
        if (role === "supervisor-akademik") {
            redirectPath = "/supervisor-akademik/surat/perlu-tindakan";
        } else if (role === "manajer-tu") {
            redirectPath = "/manajer-tu/surat/perlu-tindakan";
        } else if (role === "wakil-dekan-1") {
            redirectPath = "/wakil-dekan-1/surat/perlu-tindakan";
        } else if (role === "upa") {
            redirectPath = "/upa/surat/perlu-tindakan";
        }

        setPendingRedirect(redirectPath);
        setStatusModal({
            isOpen: true,
            status: "success",
            type: modalConfig.type,
            message: messages[modalConfig.type],
        });
    };

    const identitasData: IdentitasPengajuProps["data"] = {
        namaLengkap: initialData?.formData?.namaLengkap || "N/A",
        role: "Mahasiswa",
        nim: initialData?.formData?.nim || "N/A",
        email: initialData?.formData?.email || "N/A",
        departemen: initialData?.formData?.departemen || "N/A",
        programStudi: initialData?.formData?.programStudi || "N/A",
        tempatLahir: initialData?.formData?.tempatLahir || "N/A",
        tanggalLahir: initialData?.formData?.tanggalLahir || "N/A",
        noHp: initialData?.formData?.noHp || "N/A",
        semester: initialData?.formData?.semester || "N/A",
        ipk: initialData?.formData?.ipk || "N/A",
        ips: initialData?.formData?.ips || "N/A",
    };

    const detailSuratData: DetailSuratPengajuanProps["data"] = {
        jenisSurat: "Surat Rekomendasi Beasiswa",
        keperluan:
            initialData?.scholarshipName ||
            initialData?.formData?.namaBeasiswa ||
            "N/A",
    };

    const breadcrumbs: Record<string, { label: string; href?: string }[]> = {
        "supervisor-akademik": [
            { label: "Dashboard", href: "/supervisor-akademik" },
            {
                label: "Surat Masuk",
                href: "/supervisor-akademik/surat/perlu-tindakan",
            },
            { label: "Identitas Pemohon" },
        ],
        "manajer-tu": [
            { label: "Dashboard", href: "/manajer-tu" },
            { label: "Surat Masuk", href: "/manajer-tu/surat/perlu-tindakan" },
            { label: "Identitas Pemohon" },
        ],
        "wakil-dekan-1": [
            { label: "Dashboard", href: "/wakil-dekan-1" },
            {
                label: "Surat Masuk",
                href: "/wakil-dekan-1/surat/perlu-tindakan",
            },
            { label: "Detail Penandatanganan" },
        ],
        upa: [
            { label: "Dashboard", href: "/upa" },
            { label: "Surat Masuk", href: "/upa/surat/perlu-tindakan" },
            { label: "Detail Publikasi" },
        ],
    };

    // Determine the list link based on status
    const isCompleted = initialData?.status === "COMPLETED";
    const listHref = isCompleted
        ? `/${role}/surat/selesai`
        : `/${role}/surat/perlu-tindakan`;
    const listLabel = isCompleted ? "Surat Selesai" : "Surat Masuk";

    const currentBreadcrumb = breadcrumbs[role] || [
        { label: "Dashboard", href: `/${role}` },
        { label: listLabel, href: listHref },
        { label: "Detail Surat" },
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

            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
                {currentBreadcrumb.map((crumb, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
                        {crumb.href && index < currentBreadcrumb.length - 1 ? (
                            <Link
                                href={crumb.href}
                                className="hover:text-undip-blue transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span
                                className={
                                    index === currentBreadcrumb.length - 1
                                        ? "text-slate-800"
                                        : ""
                                }
                            >
                                {crumb.label}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Identitas Pengaju */}
                    <IdentitasPengaju data={identitasData} />

                    {/* Detail Surat Pengajuan */}
                    <DetailSuratPengajuan data={detailSuratData} />

                    {/* Lampiran Section */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            Lampiran
                        </h2>
                        <div className="space-y-4">
                            {initialData?.attachments?.map((att) => (
                                <div
                                    key={att.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <Link
                                        href={att.downloadUrl || "#"}
                                        target="_blank"
                                    >
                                        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-800">
                                                    {att.category || "Lampiran"}
                                                </span>
                                                <span className="text-slate-400 text-sm">
                                                    - {att.filename}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
                                        </button>
                                    </Link>
                                    <div className="px-4 pb-4 pt-4 bg-slate-50">
                                        {att.mimeType?.startsWith(
                                            "application/pdf",
                                        ) ||
                                        att.filename
                                            ?.toLowerCase()
                                            .endsWith(".pdf") ? (
                                            <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <iframe
                                                    src={att.downloadUrl}
                                                    className="w-full h-[500px]"
                                                    title={att.filename}
                                                />
                                            </div>
                                        ) : att.mimeType?.startsWith(
                                              "image/",
                                          ) ||
                                          att.filename?.match(
                                              /\.(jpg|jpeg|png|gif)$/i,
                                          ) ? (
                                            <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <div className="relative w-full h-auto min-h-[300px]">
                                                    <Image
                                                        src={
                                                            att.downloadUrl ||
                                                            ""
                                                        }
                                                        alt={att.filename}
                                                        width={0}
                                                        height={0}
                                                        sizes="100vw"
                                                        className="w-full h-auto object-contain"
                                                        unoptimized
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                                                <p className="text-sm">
                                                    Preview tidak tersedia.
                                                </p>
                                                <Link
                                                    href={
                                                        att.downloadUrl || "#"
                                                    }
                                                    target="_blank"
                                                    className="text-undip-blue hover:underline text-xs mt-2"
                                                >
                                                    Download File
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!initialData?.attachments ||
                                initialData.attachments.length === 0) && (
                                <p className="text-slate-400 italic">
                                    Tidak ada lampiran.
                                </p>
                            )}
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
                                href={`${
                                    role === "supervisor-akademik"
                                        ? "/supervisor-akademik"
                                        : role === "manajer-tu"
                                          ? "/manajer-tu"
                                          : role === "wakil-dekan-1"
                                            ? "/wakil-dekan-1"
                                            : "/upa"
                                }/surat/proses/preview/${id}?stage=${
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
                            ...(initialData?.history?.map((log) => ({
                                senderRole: log.actor?.name || "Sistem",
                                receiverRole: "-",
                                status: log.status || log.action,
                                date: new Date(
                                    log.createdAt,
                                ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }),
                                time: new Date(
                                    log.createdAt,
                                ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                }),
                                catatan: log.note || "-",
                            })) || []),
                            {
                                senderRole:
                                    initialData?.createdBy?.mahasiswa?.user
                                        ?.name || "Mahasiswa",
                                receiverRole: "Supervisor Akademik",
                                status: "Diajukan",
                                date: initialData?.createdAt
                                    ? new Date(
                                          initialData.createdAt,
                                      ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                      })
                                    : "-",
                                time: initialData?.createdAt
                                    ? new Date(
                                          initialData.createdAt,
                                      ).toLocaleTimeString("id-ID", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                      })
                                    : "-",
                                catatan: "-",
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
