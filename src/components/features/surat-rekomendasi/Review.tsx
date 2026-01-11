import React from "react";
import type { FormDataType } from "@/types/form";
import { FileText } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        <div className="flex flex-row items-start py-3 border-b border-gray-100 last:border-0 gap-48">
            <span className="text-sm text-gray-500 font-medium w-40 sm:w-52 shrink-0">
                {label}
            </span>

            <span className="text-sm font-semibold text-gray-900 text-left flex-1">
                {value}
            </span>
        </div>
    );
}

function FileItem({ name, size }: { name: string; size: string }) {
    return (
        <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md mr-3">
                <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">
                    {name}
                </p>
                <p className="text-xs text-gray-400">{size}</p>
            </div>
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
        ].every((k) => !!data[k]);

    const hasMainAttachments =
        Array.isArray(data.lampiranUtama) && data.lampiranUtama.length > 0;

    const formatSize = (size?: number) => {
        if (!size && size !== 0) return "-";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024)
            return `${(size / 1024).toFixed(1).replace(/\.0$/, "")} KB`;
        return `${(size / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
    };

    return (
        <section aria-label="Review dan Ajukan" className="space-y-6">
            
            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-gray-100">
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
                        <SummaryRow label="IPK" value={data.ipk || "-"} />
                        <SummaryRow label="IPS" value={data.ips || "-"} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-gray-100">
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
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base font-bold text-gray-800">
                        Lampiran Dokumen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(data.lampiranUtama) &&
                        data.lampiranUtama.length > 0 ? (
                            data.lampiranUtama.map((f, i) => (
                                <FileItem
                                    key={`main-${i}`}
                                    name={(f as any).name || "Unknown"}
                                    size={formatSize((f as any).size as number)}
                                />
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">
                                No main attachments
                            </div>
                        )}

                        {Array.isArray(data.lampiranTambahan) &&
                            data.lampiranTambahan.length > 0 &&
                            data.lampiranTambahan.map((f, i) => (
                                <FileItem
                                    key={`extra-${i}`}
                                    name={(f as any).name || "Unknown"}
                                    size={formatSize((f as any).size as number)}
                                />
                            ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}