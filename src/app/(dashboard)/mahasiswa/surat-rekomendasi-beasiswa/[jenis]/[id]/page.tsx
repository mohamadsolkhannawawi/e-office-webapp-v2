"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    LampiranSurat,
    RiwayatSurat,
} from "@/components/features/detail-surat";
import {
    getApplicationById,
    type ApplicationDetail,
} from "@/lib/application-api";

export default function DetailPengajuanPage() {
    const params = useParams();
    const router = useRouter();
    const jenis = params.jenis as string;
    const id = params.id as string;

    const [application, setApplication] = useState<ApplicationDetail | null>(
        null
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
                        : "Gagal memuat data pengajuan"
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

    // Map application data ke format komponen
    const identitasData = {
        namaLengkap: application.formData.namaLengkap,
        nimNip: application.formData.nim,
        email: application.formData.email,
        departemen: application.formData.departemen,
        programStudi: application.formData.programStudi,
        tempatLahir: application.formData.tempatLahir,
        tanggalLahir: formatDate(application.formData.tanggalLahir),
        noHp: application.formData.noHp,
        ipk: application.formData.ipk,
        ips: application.formData.ips,
    };

    const detailSuratData = {
        jenisSurat: "SRB / Surat Rekomendasi Beasiswa",
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}`}
                    >
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

                <div className="lg:col-span-1">
                    <RiwayatSurat
                        applicationId={application.id}
                        status={application.status}
                        createdAt={application.createdAt}
                    />
                </div>
            </div>
        </div>
    );
}
