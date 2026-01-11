import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InfoRowProps {
    label: string;
    value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600 font-medium w-full sm:w-40 mb-1 sm:mb-0">
                {label}
            </span>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
    );
}

interface DetailSuratPengajuanProps {
    data?: {
        jenisSurat: string;
        namaBeasiswa?: string;
        keperluan?: string;
        status?: string;
    };
}

export function DetailSuratPengajuan({ data }: DetailSuratPengajuanProps) {
    const detail = data || {
        jenisSurat: "SRB / Surat Rekomendasi Beasiswa",
        namaBeasiswa: "Beasiswa Djarum Foundation",
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending
                    </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Diproses
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Selesai
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Ditolak
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center justify-between">
                    <span>Detail Surat Pengajuan</span>
                    {data?.status && getStatusBadge(data.status)}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-0">
                    <InfoRow label="Jenis Surat" value={detail.jenisSurat} />
                    <InfoRow
                        label="Nama Beasiswa"
                        value={detail.namaBeasiswa || detail.keperluan || "-"}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
