"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    RiwayatSurat,
    LampiranSurat,
    DetailRevisi,
} from "@/components/features/surat-rekomendasi-beasiswa/detail/common";
import {
    getApplicationById,
    type ApplicationDetail,
} from "@/lib/application-api";
import { getReceiverRole } from "@/utils/status-mapper";

// Custom Icon for EditNote if not found
const EditNoteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

export default function DetailSuratProsesPage() {
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
        keperluan: application.scholarshipName || "-",
    };

    // Use LampiranSurat component or map manually if structure is different
    // Here we use LampiranSurat for consistency
    const lampiranData = application.attachments.map((att) => ({
        id: att.id,
        name: att.filename,
        type: att.mimeType,
        size: att.fileSize,
        category: att.category,
        downloadUrl: att.downloadUrl,
    }));

    const riwayatData = application.history?.map((h) => ({
        senderRole: h.role?.name || h.actor.name || "Pengguna",
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

    const canEdit =
        (application.status as string) === "DRAFT" ||
        ((application.status as string) === "REVISION" &&
            application.currentStep === 0);

    // Get jenis for editing from application data
    const jenis =
        ((application.formData as unknown as Record<string, unknown>)
            .jenisBeasiswa as string) || "internal";

    // Cari histori revisi terakhir
    let revisiHistory = null;
    if (application.history && Array.isArray(application.history)) {
        revisiHistory = [...application.history]
            .reverse()
            .find((h) => h.status === "REVISION");
    }

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
                <span className="text-slate-800">Detail Surat</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tampilkan alasan revisi jika status REVISION dan revisi ditujukan ke mahasiswa (currentStep === 0) */}
                    {application.status === "REVISION" &&
                        application.currentStep === 0 &&
                        revisiHistory && (
                            <DetailRevisi
                                checker={
                                    revisiHistory.actor?.role?.name ||
                                    revisiHistory.actor?.name ||
                                    "-"
                                }
                                comment={revisiHistory.note || "-"}
                                revisionDate={revisiHistory.createdAt}
                            />
                        )}
                    {/* Identitas Pengaju */}
                    <IdentitasPengaju data={identitasData} />

                    {/* Detail Surat Pengajuan */}
                    <DetailSuratPengajuan data={detailSuratData} />

                    {/* Lampiran Section */}
                    <LampiranSurat data={lampiranData} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Aksi Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">
                            Aksi
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href={`/mahasiswa/surat/proses/preview/${id}?stage=mahasiswa`}
                            >
                                <Button className="w-full bg-slate-500 hover:bg-slate-600 text-white font-medium py-6 rounded-3xl flex items-center justify-center gap-2 mb-3">
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                            </Link>

                            {application.status === "COMPLETED" && (
                                <Link
                                    href={`/mahasiswa/surat/proses/preview/${id}?stage=mahasiswa&autoPrint=true`}
                                    target="_blank"
                                >
                                    <Button className="w-full bg-undip-blue hover:bg-sky-700 text-white font-medium py-6 rounded-3xl flex items-center justify-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </Link>
                            )}

                            {canEdit && (
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${id}`,
                                        )
                                    }
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-3xl flex items-center justify-center gap-2"
                                >
                                    <EditNoteIcon />
                                    Revisi
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Timeline Card */}
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
