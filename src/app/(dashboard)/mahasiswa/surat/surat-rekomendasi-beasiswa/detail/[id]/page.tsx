"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Loader2,
    ChevronRight,
    Eye,
    RotateCcw,
    Download,
} from "lucide-react";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    LampiranSurat,
    RiwayatSurat,
} from "@/components/features/surat-rekomendasi-beasiswa/detail/common";
import {
    getApplicationById,
    type ApplicationDetail,
} from "@/lib/application-api";

import { getReceiverRole } from "@/utils/status-mapper";

export default function DetailPengajuanPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [application, setApplication] = useState<ApplicationDetail | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchApplication() {
            try {
                setLoading(true);
                const data = await getApplicationById(id);
                setApplication(data);
            } catch (err) {
                console.error("Error fetching application:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Gagal memuat data pengajuan",
                );
            } finally {
                setLoading(false);
            }
        }

        fetchApplication();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        {error || "Pengajuan tidak ditemukan"}
                    </p>
                    <Button onClick={() => router.back()}>Kembali</Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    // Map application data ke format komponen
    const identitasData = {
        namaLengkap: application.formData.namaLengkap,
        nim: application.formData.nim,
        role: application.createdBy?.mahasiswa ? "Mahasiswa" : "Pegawai",
        email: application.formData.email,
        departemen: application.formData.departemen,
        programStudi: application.formData.programStudi,
        tempatLahir: application.formData.tempatLahir,
        tanggalLahir: formatDate(application.formData.tanggalLahir),
        noHp: application.formData.noHp,
        semester: application.formData.semester || "-",
        ipk: application.formData.ipk,
        ips: application.formData.ips,
    };

    const detailSuratData = {
        jenisSurat: application.letterType?.name
            ? `${application.letterType.name}${
                  application.formData.jenisBeasiswa
                      ? ` (${application.formData.jenisBeasiswa})`
                      : ""
              }`
            : `Surat Rekomendasi Beasiswa${
                  application.formData.jenisBeasiswa
                      ? ` (${application.formData.jenisBeasiswa})`
                      : ""
              }`,
        namaBeasiswa: application.scholarshipName || "-",
        status: application.status,
    };

    const lampiranData = application.attachments.map((att) => ({
        id: att.id,
        name: att.filename,
        type: att.mimeType,
        size: att.fileSize,
        category: att.category,
        downloadUrl: att.downloadUrl,
    }));

    const canEdit =
        (application.status as string) === "REVISION" ||
        (application.status as string) === "DRAFT";

    const isPublished =
        (application.status as string) === "COMPLETED" ||
        (application.status as string) === "PUBLISHED";

    // Get jenis for editing from application data
    const jenis =
        ((application.formData as unknown as Record<string, unknown>)
            .jenisBeasiswa as string) || "internal";

    const riwayatData = application.history?.map((h) => ({
        senderRole: h.role?.name || h.actor.name,
        receiverRole: getReceiverRole(
            h.action,
            application.currentStep,
            h.note,
            h.role?.name || h.actor.name,
        ),
        status: h.status,
        date: new Date(h.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        time: new Date(h.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }),
        catatan: h.note,
        actionType: h.action,
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500 mb-4">
                <Link
                    href="/mahasiswa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Dashboard
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <Link
                    href="/mahasiswa/surat/proses"
                    className="hover:text-undip-blue transition-colors"
                >
                    Persuratan
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Detail Pengajuan</span>
            </nav>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/mahasiswa/surat/proses`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Detail Pengajuan
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {application.scholarshipName ||
                                "Surat Rekomendasi Beasiswa"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <IdentitasPengaju data={identitasData} />
                    <DetailSuratPengajuan data={detailSuratData} />
                    <LampiranSurat data={lampiranData} />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Aksi Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">
                            Aksi
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href={`/mahasiswa/surat/proses/preview/${id}?stage=mahasiswa`}
                            >
                                <Button className="w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </Button>
                            </Link>

                            {canEdit && (
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${id}`,
                                        )
                                    }
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                    Revisi
                                </Button>
                            )}

                            {isPublished && (
                                <Link
                                    href={`/mahasiswa/surat/proses/preview/${id}?stage=mahasiswa&autoPrint=true`}
                                    target="_blank"
                                >
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-lg flex items-center justify-center gap-2">
                                        <Download className="h-5 w-5" />
                                        Download
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <RiwayatSurat
                        applicationId={application.id}
                        status={application.status}
                        createdAt={application.createdAt}
                        riwayat={riwayatData}
                    />
                </div>
            </div>
        </div>
    );
}
