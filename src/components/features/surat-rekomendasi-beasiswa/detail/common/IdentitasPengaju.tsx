import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InfoRowProps {
    label: string;
    value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-200 last:border-0 hover:bg-gray-50/30 transition-colors px-6">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="md:col-span-2 text-sm font-bold text-slate-800">
                {value}
            </span>
        </div>
    );
}

export interface IdentitasPengajuProps {
    data?: {
        namaLengkap: string;
        role: string;
        nim: string;
        email: string;
        departemen: string;
        programStudi: string;
        tempatLahir: string;
        tanggalLahir: string;
        noHp: string;
        semester: string;
        ipk: string;
        ips: string;
    };
}

export function IdentitasPengaju({ data }: IdentitasPengajuProps) {
    const identitas = {
        namaLengkap: data?.namaLengkap || "N/A",
        role: data?.role || "Mahasiswa",
        nim: data?.nim || "Pribadi",
        email: data?.email || "N/A",
        departemen: data?.departemen || "-",
        programStudi: data?.programStudi || "-",
        tempatLahir: data?.tempatLahir || "-",
        tanggalLahir: data?.tanggalLahir || "-",
        noHp: data?.noHp || "-",
        semester: data?.semester || "-",
        ipk: data?.ipk || "-",
        ips: data?.ips || "-",
    };

    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="pb-2 border-b border-gray-300 gap-0">
                <CardTitle className="text-base font-bold text-gray-800">
                    Identitas Pengaju
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="space-y-0">
                    <InfoRow
                        label="Nama Lengkap"
                        value={identitas.namaLengkap}
                    />
                    <InfoRow label="Role" value={identitas.role} />
                    <InfoRow label="NIM" value={identitas.nim} />
                    <InfoRow label="Email" value={identitas.email} />
                    <InfoRow label="Departemen" value={identitas.departemen} />
                    <InfoRow
                        label="Program Studi"
                        value={identitas.programStudi}
                    />
                    <InfoRow
                        label="Tempat Lahir"
                        value={identitas.tempatLahir}
                    />
                    <InfoRow
                        label="Tanggal Lahir"
                        value={identitas.tanggalLahir}
                    />
                    <InfoRow label="No HP" value={identitas.noHp} />
                    <InfoRow label="Semester" value={identitas.semester} />
                    <InfoRow label="IPK" value={identitas.ipk} />
                    <InfoRow label="IPS" value={identitas.ips} />
                </div>
            </CardContent>
        </Card>
    );
}
