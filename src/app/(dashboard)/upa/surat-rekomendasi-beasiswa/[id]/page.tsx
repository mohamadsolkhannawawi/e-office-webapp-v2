"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle, Printer } from "lucide-react";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function UPADetailSRBPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [application, setApplication] = useState<ApplicationDetail | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Action State
    const [note, setNote] = useState("");
    const [letterNumber, setLetterNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleAction = async (action: "approve" | "reject" | "revision") => {
        if (action === "approve" && !letterNumber) {
            alert("Harap masukkan Nomor Surat sebelum menerbitkan.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(
                `/api/surat-rekomendasi/applications/${id}/verify`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action,
                        notes: note,
                        letterNumber:
                            action === "approve" ? letterNumber : undefined,
                    }),
                },
            );

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Gagal memproses aksi");
            }

            router.push("/upa/surat-rekomendasi-beasiswa");
        } catch (err) {
            console.error("Action error:", err);
            alert(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat memproses data.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">
                    {error || "Data tidak ditemukan"}
                </p>
                <Button onClick={() => router.back()}>Kembali</Button>
            </div>
        );
    }

    // Helper formatting
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    const identitasData = {
        namaLengkap: application.formData.namaLengkap,
        nim: application.formData.nim, // Changed from nimNip to nim
        role: "Mahasiswa", // Added role
        email: application.formData.email,
        departemen: application.formData.departemen,
        programStudi: application.formData.programStudi,
        semester: application.formData.semester || "-", // Added semester
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
            <div className="flex items-center gap-4">
                <Link href="/upa/surat-rekomendasi-beasiswa">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Penerbitan Surat
                    </h1>
                    <p className="text-sm text-gray-600">
                        Masukkan nomor surat dan terbitkan dokumen yang telah
                        valid.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <IdentitasPengaju data={identitasData} />
                    <DetailSuratPengajuan data={detailSuratData} />
                    <LampiranSurat data={lampiranData} />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tindakan UPA</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Letter Number Input Section */}
                            <div className="space-y-2 border-b pb-4">
                                <Label className="text-indigo-700 font-semibold">
                                    Nomor Surat
                                </Label>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Masukkan nomor register surat keluar untuk
                                    dokumen ini.
                                </div>
                                <Input
                                    placeholder="Contoh: 123/UN7.5.8/PP/2026"
                                    value={letterNumber}
                                    onChange={(e) =>
                                        setLetterNumber(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Catatan (Opsional)</Label>
                                <Textarea
                                    placeholder="Catatan..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-2">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => handleAction("approve")}
                                    disabled={isSubmitting}
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Terbitkan Surat
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => handleAction("revision")}
                                    disabled={isSubmitting}
                                >
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Kembalikan (Revisi)
                                </Button>
                                {/* Reject is less common for UPA but supported */}
                            </div>
                        </CardContent>
                    </Card>

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
