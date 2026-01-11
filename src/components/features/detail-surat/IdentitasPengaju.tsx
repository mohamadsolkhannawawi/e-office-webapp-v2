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
      <span className="text-sm font-semibold text-gray-900">
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
    sks: string;
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
    sks: "102",
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
          <InfoRow label="Nama Lengkap" value={identitas.namaLengkap} />
          <InfoRow label="NIM/NIP" value={identitas.nimNip} />
          <InfoRow label="Email" value={identitas.email} />
          <InfoRow label="Departemen" value={identitas.departemen} />
          <InfoRow label="Program Studi" value={identitas.programStudi} />
          <InfoRow label="Tempat Lahir" value={identitas.tempatLahir} />
          <InfoRow label="Tanggal Lahir" value={identitas.tanggalLahir} />
          <InfoRow label="No HP" value={identitas.noHp} />
          <InfoRow label="IPK" value={identitas.ipk} />
          <InfoRow label="SKS" value={identitas.sks} />
        </div>
      </CardContent>
    </Card>
  );
}