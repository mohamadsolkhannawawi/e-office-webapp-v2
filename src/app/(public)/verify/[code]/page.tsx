import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    CheckCircle2,
    XCircle,
    Search,
    Calendar,
    FileText,
    Eye,
} from "lucide-react";
import { verifyLetterPublic } from "@/lib/application-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logoUndip from "@/assets/images/logo-undip-navbar.png";

interface VerifyPageProps {
    params: {
        code: string;
    };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { code } = params;
    const result = await verifyLetterPublic(code);

    const isValid = result?.valid;
    const documentData = result?.data;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md space-y-8 animate-in zoom-in duration-500">
                {/* Header Logo */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-undip-blue p-3 rounded-2xl shadow-lg mb-2">
                        <Image
                            src={logoUndip}
                            alt="Logo UNDIP"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Fakultas Sains dan Matematika
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Verified Document System
                        </p>
                    </div>
                </div>

                <Card className="border-none shadow-xl overflow-hidden relative">
                    <div
                        className={`absolute top-0 left-0 w-full h-1.5 ${isValid ? "bg-green-500" : "bg-red-500"}`}
                    />

                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4">
                            {isValid ? (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-in bounce-in">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 animate-in bounce-in">
                                    <XCircle className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-xl">
                            {isValid
                                ? "Dokumen Valid"
                                : "Dokumen Tidak Ditemukan"}
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            {isValid
                                ? "Dokumen ini terdaftar resmi dalam sistem kami."
                                : "Kode verifikasi tidak ditemukan atau tidak valid."}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        {isValid && documentData ? (
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-4 h-4 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Nomor Surat
                                            </p>
                                            <p className="font-semibold text-slate-800 break-all">
                                                {documentData.letterNumber}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Tanggal Terbit
                                            </p>
                                            <p className="font-semibold text-slate-800">
                                                {new Date(
                                                    documentData.issuedAt,
                                                ).toLocaleDateString("id-ID", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Eye className="w-4 h-4 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Jumlah Verifikasi
                                            </p>
                                            <p className="font-semibold text-slate-800">
                                                {documentData.verifiedCount}{" "}
                                                kali
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg text-center font-medium">
                                    Kode Verifikasi:{" "}
                                    <span className="font-bold font-mono tracking-wider">
                                        {code}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-800 text-sm p-4 rounded-xl text-center">
                                Mohon pastikan kode yang Anda masukkan benar
                                atau scan ulang QR Code pada dokumen fisik.
                            </div>
                        )}

                        <div className="pt-2">
                            <Link href="/">
                                <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                    <Search className="w-4 h-4 mr-2" />
                                    Cek Dokumen Lain
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    &copy; 2026 E-Office Fakultas Sains dan Matematika UNDIP
                </p>
            </div>
        </div>
    );
}
