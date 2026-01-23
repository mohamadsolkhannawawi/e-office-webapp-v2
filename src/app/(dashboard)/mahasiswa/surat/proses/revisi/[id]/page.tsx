"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    RiwayatSurat,
    DetailRevisi,
    LampiranSurat,
} from "@/components/features/surat-rekomendasi-beasiswa/detail/common";
import {
    getApplicationById,
    type ApplicationDetail,
} from "@/lib/application-api";
import { getReceiverRole } from "@/utils/status-mapper";

export default function DetailRevisiPage() {
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
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
        role: application.createdBy?.mahasiswa ? "Mahasiswa" : "Pemohon",
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

    const lampiranData = application.attachments.map((att) => ({
        id: att.id,
        name: att.filename,
        type: att.mimeType,
        size: att.fileSize,
        category: att.category,
        downloadUrl: att.downloadUrl,
    }));

    const riwayatData = application.history?.map((h) => ({
        senderRole: h.actor.role?.name || h.actor.name,
        receiverRole: getReceiverRole(h.action, application.currentStep),
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

    // Find the revisions note
    // Look for the latest history entry with status REVISION or action revision
    const latestRevision = application.history
        ?.filter(
            (h) =>
                h.status === "REVISION" ||
                h.action === "revision" ||
                h.action === "revise",
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )[0];

    const revisionNote = latestRevision?.note || "Harap perbaiki data Anda.";
    const revisionChecker =
        latestRevision?.actor?.role?.name ||
        latestRevision?.actor?.name ||
        "Reviewer";

    const jenis =
        ((application.formData as unknown as Record<string, unknown>)
            .jenisBeasiswa as string) || "internal";

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
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
                <span className="text-slate-800">Detail Surat (Revisi)</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Detail Revisi Section */}
                    {latestRevision && (
                        <DetailRevisi
                            checker={revisionChecker}
                            comment={revisionNote}
                        />
                    )}

                    {/* Identitas Pengaju */}
                    <IdentitasPengaju data={identitasData} />

                    {/* Detail Surat Pengajuan */}
                    <DetailSuratPengajuan data={detailSuratData} />

                    {/* Lampiran */}
                    <LampiranSurat data={lampiranData} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Button
                        onClick={() =>
                            router.push(
                                `/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${id}`,
                            )
                        }
                        className="w-full bg-undip-blue hover:bg-sky-700 text-white font-bold py-7 rounded shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Send className="h-4 w-4" />
                        Perbaiki Pengajuan
                    </Button>

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
