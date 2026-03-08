"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Check,
    AlertCircle,
    Loader2,
    FileText,
    Calendar,
    Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface VerificationResult {
    isValid: boolean;
    letterNumber: string;
    issuedAt: string;
    verifiedCount: number;
    application: {
        id: string;
        namaAplikasi: string;
        values?: {
            nama?: string;
            nim?: string;
        };
        letterType?: {
            name: string;
            code: string;
        };
    };
}

export default function VerifyPage() {
    const params = useParams();
    const code = params.code as string;
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/surat-rekomendasi/verify/${code}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    setError(
                        errorData.message ||
                            "Kode verifikasi tidak valid atau sudah kadaluarsa",
                    );
                    setResult(null);
                    return;
                }

                const data = await response.json();
                setResult(data.data);
                setError(null);
            } catch (err) {
                console.error("Verification error:", err);
                setError("Terjadi kesalahan saat memverifikasi surat");
                setResult(null);
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [code]);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {loading && (
                    <Card className="border-none shadow-xl">
                        <CardContent className="pt-8 flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 text-undip-blue animate-spin" />
                            <p className="text-slate-600 font-medium">
                                Sedang memverifikasi surat...
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!loading && error && (
                    <Card className="border-red-200 bg-red-50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                Verifikasi Gagal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-red-600">{error}</p>
                            <p className="text-sm text-slate-600">
                                Pastikan URL atau QR code yang Anda pindai
                                benar. Jika masalah berlanjut, hubungi
                                administrator.
                            </p>
                            <Link
                                href="/"
                                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                Kembali ke Beranda
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {!loading && result && (
                    <Card className="border-green-200 bg-green-50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <Check className="h-5 w-5" />
                                Surat Terverifikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-white rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Hash className="h-5 w-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                                            Nomor Surat
                                        </p>
                                        <p className="font-mono font-semibold text-slate-800 break-all">
                                            {result.letterNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                                            Jenis Surat
                                        </p>
                                        <p className="font-semibold text-slate-800">
                                            {result.application.letterType
                                                ?.name ||
                                                "Surat Rekomendasi Beasiswa"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                                            Tanggal Terbit
                                        </p>
                                        <p className="font-semibold text-slate-800">
                                            {new Date(
                                                result.issuedAt,
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {result.application.values?.nama && (
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                Nama Penerima
                                            </p>
                                            <p className="font-semibold text-slate-800">
                                                {result.application.values.nama}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-green-200 pt-4">
                                <p className="text-xs text-slate-600">
                                    Surat ini telah diverifikasi{" "}
                                    <span className="font-semibold">
                                        {result.verifiedCount}
                                    </span>{" "}
                                    kali
                                </p>
                            </div>

                            <p className="text-sm text-slate-600">
                                Surat ini adalah dokumen resmi yang telah
                                ditandatangani oleh pejabat berwenang dan
                                tersimpan dalam sistem administrasi elektronik
                                Universitas Diponegoro.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
