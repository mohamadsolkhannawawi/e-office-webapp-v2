import React from "react";
import type { FormDataType, LampiranFile } from "@/types/form";
import { FaCheckCircle } from "react-icons/fa";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    FilePreview,
    FilePreviewItem,
} from "@/components/features/common/FilePreview";

interface ReviewProps {
    data: FormDataType;
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row items-start py-3 border-b border-gray-200 last:border-0 gap-2 sm:gap-48">
            <span className="text-sm text-gray-500 font-medium w-full sm:w-40 sm:w-52 shrink-0">
                {label}
            </span>

            <span className="text-sm font-semibold text-gray-900 text-left flex-1">
                {value}
            </span>
        </div>
    );
}

export function Review({ data }: ReviewProps) {
    const isDataComplete = () =>
        [
            "namaLengkap",
            "role",
            "nim",
            "email",
            "departemen",
            "programStudi",
            "tempatLahir",
            "tanggalLahir",
            "noHp",
            "ipk",
            "ips",
            "semester",
        ].every((k) => !!data[k]);

    const hasMainAttachments =
        Array.isArray(data.lampiranUtama) && data.lampiranUtama.length >= 2;

    // Konversi file ke format FilePreviewItem
    const previewFiles: FilePreviewItem[] = [];

    if (Array.isArray(data.lampiranUtama)) {
        data.lampiranUtama.forEach((f: LampiranFile) => {
            previewFiles.push({
                name: f.name || "Unknown",
                type: f.type || "",
                size: f.size || 0,
                file: f.file,
                url: f.downloadUrl, // Use downloadUrl from MinIO upload
            });
        });
    }

    if (Array.isArray(data.lampiranTambahan)) {
        data.lampiranTambahan.forEach((f: LampiranFile) => {
            previewFiles.push({
                name: f.name || "Unknown",
                type: f.type || "",
                size: f.size || 0,
                file: f.file,
                url: f.downloadUrl, // Use downloadUrl from MinIO upload
            });
        });
    }

    return (
        <section aria-label="Review dan Ajukan" className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-gray-300 gap-0">
                    <CardTitle className="text-base font-bold text-gray-800">
                        Identitas Pengaju
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col">
                        <SummaryRow
                            label="Nama Lengkap"
                            value={data.namaLengkap || "-"}
                        />
                        <SummaryRow label="NIM/NIP" value={data.nim || "-"} />
                        <SummaryRow label="Email" value={data.email || "-"} />
                        <SummaryRow
                            label="Departement"
                            value={data.departemen || "-"}
                        />
                        <SummaryRow
                            label="Program Studi"
                            value={data.programStudi || "-"}
                        />
                        <SummaryRow
                            label="Tempat Lahir"
                            value={data.tempatLahir || "-"}
                        />
                        <SummaryRow
                            label="Tanggal Lahir"
                            value={data.tanggalLahir || "-"}
                        />
                        <SummaryRow label="No HP" value={data.noHp || "-"} />
                        <SummaryRow
                            label="Semester"
                            value={data.semester || "-"}
                        />
                        <SummaryRow label="IPK" value={data.ipk || "-"} />
                        <SummaryRow label="IPS" value={data.ips || "-"} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-gray-300 gap-0">
                    <CardTitle className="text-base font-bold text-gray-800">
                        Detail Surat Pengajuan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col">
                        <SummaryRow
                            label="Jenis Surat"
                            value="SRB / Surat Rekomendasi Beasiswa"
                        />
                        <SummaryRow
                            label="Nama Beasiswa"
                            value={data.namaBeasiswa || "-"}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-green-50 border border-green-200">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-green-800">
                        Checklist Kesiapan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-row items-center py-2">
                            <span className="text-sm text-green-700 font-medium flex items-center">
                                {isDataComplete() ? (
                                    <FaCheckCircle className="inline w-4 h-4 mr-2 text-green-600" />
                                ) : (
                                    <span className="inline-block w-4 h-4 mr-2 rounded-full bg-gray-200" />
                                )}
                                Data ini lengkap
                            </span>
                        </div>

                        <div className="flex flex-row items-center py-2">
                            <span className="text-sm text-green-700 font-medium flex items-center">
                                {hasMainAttachments ? (
                                    <FaCheckCircle className="inline w-4 h-4 mr-2 text-green-600" />
                                ) : (
                                    <span className="inline-block w-4 h-4 mr-2 rounded-full bg-gray-200" />
                                )}
                                Lampiran utama ada
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-gray-300 gap-0">
                    <CardTitle className="text-base font-bold text-gray-800">
                        Lampiran Dokumen
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    {previewFiles.length > 0 ? (
                        <FilePreview
                            files={previewFiles}
                            showPreviewByDefault={true}
                            readonly={true}
                        />
                    ) : (
                        <div className="text-sm text-gray-500 text-center py-8">
                            Belum ada lampiran dokumen
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
