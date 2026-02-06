import React from "react";
import Image from "next/image";
import {
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    User,
    Building2,
    GraduationCap,
    Shield,
    History,
    Hash,
} from "lucide-react";
import {
    verifyLetterPublic,
    type VerificationHistory,
} from "@/lib/application-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoUndip from "@/assets/images/logo-undip-main.png";

interface VerifyPageProps {
    params: Promise<{
        code: string;
    }>;
}

function formatDate(dateString: string) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getActionLabel(action: string): string {
    const actionLabels: Record<string, string> = {
        CREATED: "Diajukan",
        SUBMITTED: "Diajukan",
        submit: "Diajukan",
        APPROVED: "Disetujui",
        approve: "Disetujui",
        REJECTED: "Ditolak",
        reject: "Ditolak",
        REVISION_REQUESTED: "Diminta Revisi",
        revision: "Diminta Revisi",
        PUBLISHED: "Diterbitkan",
        FORWARDED: "Diteruskan",
        REVIEWED: "Direview",
        SIGNED: "Ditandatangani",
        STAMPED: "Distempel",
        NUMBERED: "Dinomori",
    };
    return actionLabels[action] || action;
}

function getRoleLabel(roleName: string | null): string {
    if (!roleName) return "Sistem";

    const roleLabels: Record<string, string> = {
        SUPERVISOR: "Supervisor Akademik",
        MANAJER_TU: "Manajer TU",
        WAKIL_DEKAN_1: "Wakil Dekan I",
        WAKIL_DEKAN_2: "Wakil Dekan II",
        DEKAN: "Dekan",
        UPA: "UPA",
        ADMIN: "Admin",
        MAHASISWA: "Mahasiswa",
        STAFF: "Staff",
        KAPRODI: "Ketua Prodi",
        SEKPRODI: "Sekretaris Prodi",
        KAJUR: "Ketua Jurusan",
        SEKJUR: "Sekretaris Jurusan",
    };

    return roleLabels[roleName] || roleName.replace(/_/g, " ");
}

// Deduplicate history by actor + action combination
function deduplicateHistory(
    history: VerificationHistory[],
): VerificationHistory[] {
    const seen = new Map<string, VerificationHistory>();

    for (const item of history) {
        const key = `${item.actorName}-${item.action}`;
        // Keep the latest entry
        if (
            !seen.has(key) ||
            new Date(item.timestamp) > new Date(seen.get(key)!.timestamp)
        ) {
            seen.set(key, item);
        }
    }

    // Sort by timestamp ascending
    return Array.from(seen.values()).sort(
        (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
}

// Timeline Component
function HistoryTimeline({ history }: { history: VerificationHistory[] }) {
    const dedupedHistory = deduplicateHistory(history);

    return (
        <div className="space-y-6">
            {dedupedHistory.map((item, index) => (
                <div key={index} className="flex gap-4 relative">
                    {index !== dedupedHistory.length - 1 && (
                        <div className="absolute left-2.75 top-6 -bottom-6 w-0.5 bg-slate-100" />
                    )}
                    <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white ${
                            index === 0
                                ? "border-emerald-500"
                                : "border-slate-200"
                        }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${
                                index === 0 ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                        />
                    </div>
                    <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-slate-200 text-slate-500"
                            >
                                {getRoleLabel(item.roleName)}
                            </Badge>
                            <span className="text-[11px] text-slate-400 font-medium">
                                {formatDateTime(item.timestamp)}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-[#00002b]">
                            {item.actorName}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium">
                            {getActionLabel(item.action)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { code } = await params;
    const result = await verifyLetterPublic(code);

    const isValid = result?.valid;
    const documentData = result?.data;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#00002b]">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src={logoUndip}
                            alt="Logo UNDIP"
                            width={45}
                            height={45}
                            className="object-contain"
                        />
                        <div>
                            <h1 className="text-sm font-bold tracking-tight">
                                Verifikasi Surat
                            </h1>
                            <p className="text-[11px] text-undip-blue font-medium uppercase tracking-widest">
                                E-Office FSM UNDIP
                            </p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                {/* Header Status */}
                <div
                    className={`rounded-4xl p-8 text-center transition-all ${
                        isValid
                            ? "bg-emerald-50 border border-emerald-100"
                            : "bg-red-50 border border-red-100"
                    }`}
                >
                    <div
                        className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-sm ${
                            isValid ? "bg-emerald-500" : "bg-red-500"
                        }`}
                    >
                        {isValid ? (
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        ) : (
                            <XCircle className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <h2
                        className={`text-2xl font-black mb-2 ${isValid ? "text-emerald-900" : "text-red-900"}`}
                    >
                        {isValid
                            ? "Dokumen Terverifikasi"
                            : "Dokumen Tidak Ditemukan"}
                    </h2>
                    <p
                        className={`text-sm max-w-sm mx-auto font-medium opacity-80 ${isValid ? "text-emerald-700" : "text-red-700"}`}
                    >
                        {isValid
                            ? "Surat ini adalah dokumen resmi yang sah dan diterbitkan oleh sistem E-Office FSM UNDIP."
                            : "Kode verifikasi tidak terdaftar dalam database kami. Mohon periksa kembali kode Anda."}
                    </p>

                    <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Kode Verifikasi
                        </span>
                        <code className="text-lg font-black tracking-widest text-undip-blue">
                            {code}
                        </code>
                    </div>
                </div>

                {isValid && documentData ? (
                    <div className="grid gap-6">
                        {/* Info Utama */}
                        <div className="bg-undip-blue rounded-4xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                            <Shield className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
                                        Status Keaslian
                                    </p>
                                    <h3 className="text-xl font-bold">
                                        {
                                            documentData.authenticity
                                                .verificationStatement
                                        }
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                                        Dilihat
                                    </p>
                                    <div className="flex items-center justify-end gap-2 text-2xl font-black">
                                        <Eye className="w-5 h-5" />{" "}
                                        {documentData.verifiedCount}x
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Dokumen */}
                        <Card className="border-none shadow-sm rounded-4xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-wider text-slate-400">
                                    <FileText className="w-4 h-4 text-undip-blue" />{" "}
                                    Informasi Dokumen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                        Nomor Surat
                                    </p>
                                    <p className="font-bold text-[#00002b]">
                                        {documentData.letterNumber}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                        Jenis Surat
                                    </p>
                                    <p className="font-bold text-[#00002b]">
                                        {documentData.letterType.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                        Perihal / Beasiswa
                                    </p>
                                    <p className="font-bold text-[#00002b]">
                                        {documentData.application
                                            .scholarshipName || "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                        Tanggal Terbit
                                    </p>
                                    <p className="font-bold text-[#00002b]">
                                        {formatDate(
                                            documentData.publishedAt ||
                                                documentData.issuedAt,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Penerima */}
                        <Card className="border-none shadow-sm rounded-4xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50 px-8 py-6">
                                <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-wider text-slate-400">
                                    <User className="w-4 h-4 text-undip-blue" />{" "}
                                    Profil Penerima
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                    <div className="p-8 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <User className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Nama Lengkap
                                                </p>
                                                <p className="font-bold text-[#00002b]">
                                                    {
                                                        documentData.applicant
                                                            .name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <Hash className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    NIM
                                                </p>
                                                <p className="font-bold text-[#00002b] tracking-widest">
                                                    {documentData.applicant.nim}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Departemen
                                                </p>
                                                <p className="font-bold text-[#00002b]">
                                                    {
                                                        documentData.applicant
                                                            .departemen
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                <GraduationCap className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Program Studi
                                                </p>
                                                <p className="font-bold text-[#00002b]">
                                                    {
                                                        documentData.applicant
                                                            .programStudi
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Riwayat */}
                        {documentData.history &&
                            documentData.history.length > 0 && (
                                <Card className="border-none shadow-sm rounded-4xl overflow-hidden">
                                    <CardHeader className="border-b border-slate-50 px-8 py-6">
                                        <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-wider text-slate-400">
                                            <History className="w-4 h-4 text-undip-blue" />{" "}
                                            Riwayat Proses
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <HistoryTimeline
                                            history={documentData.history}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                    </div>
                ) : (
                    /* Not Found Card */
                    <Card className="border-none shadow-sm rounded-4xl p-12 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-4xl flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                            Dokumen Tidak Ditemukan
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">
                            Mohon pastikan kode yang Anda masukkan sesuai dengan
                            yang tertera pada QR Code surat.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                            <span className="text-xs text-slate-500">
                                Kode:
                            </span>
                            <code className="font-mono text-sm font-bold text-slate-700">
                                {code}
                            </code>
                        </div>
                    </Card>
                )}
            </main>

            <footer className="py-12 text-center space-y-2 opacity-50">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00002b]">
                    E-Office Digital Verification System
                </p>
                <p className="text-xs font-medium">
                    &copy; {new Date().getFullYear()} Fakultas Sains dan
                    Matematika, Universitas Diponegoro
                </p>
            </footer>
        </div>
    );
}
