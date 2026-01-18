import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InfoRowProps {
    label: string;
    value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors px-6">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="md:col-span-2 text-sm font-bold text-slate-800">
                {value}
            </span>
        </div>
    );
}

interface IdentitasPengajuProps {
    data?: {
        namaLengkap: string;
        nimNip: string;
        email: string;
        departemen: string;
        programStudi: string;
        tempatLahir: string;
        tanggalLahir: string;
        noHp: string;
        ipk: string;
        ips: string;
    };
}

export function IdentitasPengaju({ data }: IdentitasPengajuProps) {
    const identitas = data || {
        namaLengkap: "Ahmad Syaifullah",
        nimNip: "24060121120000",
        email: "ahmadsyaifullah@students.undip.ac.id",
        departemen: "Informatika",
        programStudi: "Informatika",
        tempatLahir: "Blora",
        tanggalLahir: "03/18/2003",
        noHp: "081234567890",
        ipk: "3.6",
        ips: "3.8",
    };

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold text-gray-800">
                    Identitas Pengaju
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
                <div className="space-y-0">
                    <InfoRow
                        label="Nama Lengkap"
                        value={identitas.namaLengkap}
                    />
                    <InfoRow label="NIM/NIP" value={identitas.nimNip} />
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
                    <InfoRow label="IPK" value={identitas.ipk} />
                    <InfoRow label="IPS" value={identitas.ips} />
                </div>
            </CardContent>
        </Card>
    );
}
