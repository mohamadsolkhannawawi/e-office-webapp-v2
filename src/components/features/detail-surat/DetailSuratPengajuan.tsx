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

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center justify-between">
                    <span>Detail Surat Pengajuan</span>
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
