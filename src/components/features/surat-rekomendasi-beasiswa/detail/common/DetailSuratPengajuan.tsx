import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InfoRowProps {
    label: string;
    value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-6 py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50/30 transition-colors">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="md:col-span-2 text-sm font-bold text-slate-800">
                {value}
            </span>
        </div>
    );
}

export interface DetailSuratPengajuanProps {
    data?: {
        jenisSurat: string;
        namaBeasiswa?: string;
        keperluan?: string;
        status?: string;
    };
}

export function DetailSuratPengajuan({ data }: DetailSuratPengajuanProps) {
    const detail = data || {
        jenisSurat: "Surat Rekomendasi Beasiswa",
        namaBeasiswa: "-",
    };

    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="pb-3 border-b border-gray-300 gap-0">
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
