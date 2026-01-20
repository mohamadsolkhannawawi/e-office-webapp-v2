"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Loader2,
    XCircle,
    AlertCircle,
    PenTool,
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function WD1DetailSRBPage() {
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
    const [signatureUrl, setSignatureUrl] = useState(""); // Simplified signature input
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
        if (action === "approve" && !signatureUrl) {
            alert(
                "Harap masukkan URL Tanda Tangan atau Asset ID sebelum menyetujui.",
            );
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
                        signatureUrl:
                            action === "approve" ? signatureUrl : undefined,
                    }),
                },
            );

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Gagal memproses aksi");
            }

            router.push("/wakil-dekan-1/surat-rekomendasi-beasiswa");
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
        nim: application.formData.nim, // Changed from nimNip
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
                <Link href="/wakil-dekan-1/surat-rekomendasi-beasiswa">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Tanda Tangan Wakil Dekan 1
                    </h1>
                    <p className="text-sm text-gray-600">
                        Bubuhkan tanda tangan elektronik untuk mengesahkan
                        surat.
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
                            <CardTitle>Tindakan Wakil Dekan 1</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Signature Input Section */}
                            <div className="space-y-2 border-b pb-4">
                                <Label className="text-purple-700 font-semibold">
                                    Tanda Tangan Elektronik
                                </Label>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Masukkan URL atau ID aset tanda tangan Anda.
                                </div>
                                <Input
                                    placeholder="https://... atau asset_id"
                                    value={signatureUrl}
                                    onChange={(e) =>
                                        setSignatureUrl(e.target.value)
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
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    onClick={() => handleAction("approve")}
                                    disabled={isSubmitting}
                                >
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Tanda Tangani & Sahkan
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => handleAction("revision")}
                                    disabled={isSubmitting}
                                >
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Minta Revisi
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => handleAction("reject")}
                                    disabled={isSubmitting}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Tolak Pengajuan
                                </Button>
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
