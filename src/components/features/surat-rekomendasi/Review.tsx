import React from 'react';
import { FileText} from 'lucide-react';
import { FaCheckCircle } from "react-icons/fa";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function SummaryRow({ label, value }: { label: string, value: string }) {
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

function FileItem({ name, size }: { name: string, size: string }) {
  return (
    <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-md mr-3">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
        <p className="text-xs text-gray-400">{size}</p>
      </div>
    </div>
  );
}

export function Review() {
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
            <SummaryRow label="Nama Lengkap" value="Ahmad Syaifullah" />
            <SummaryRow label="NIM/NIP" value="24060121120001" />
            <SummaryRow label="Email" value="ahmadsyaifullah@students.undip.ac.id" />
            <SummaryRow label="Departement" value="Informatika" />
            <SummaryRow label="Program Studi" value="Informatika" />
            <SummaryRow label="Tempat Lahir" value="Blora" />
            <SummaryRow label="Tanggal Lahir" value="03/18/2006" />
            <SummaryRow label="No HP" value="089123141241412412" />
            <SummaryRow label="IPK" value="3.9" />
            <SummaryRow label="IPS" value="3.7" />
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
            <SummaryRow label="Jenis Surat" value="SRB / Surat Rekomendasi Beasiswa" />
            <SummaryRow label="Nama Beasiswa" value="Beasiswa Djarum Foundation" />
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
          <div className="flex flex-col">
            <div className="flex flex-row items-start py-3 gap-48">
              <span className="text-sm text-green-700 font-medium w-40 sm:w-52 shrink-0">
                <FaCheckCircle className="inline w-4 h-4 mr-2 text-green-600" />
                Data ini lengkap
              </span>
              <span className="text-sm font-semibold text-green-700 text-left flex-1"></span>
            </div>
            <div className="flex flex-row items-start py-3 gap-48">
              <span className="text-sm text-green-700 font-medium w-40 sm:w-52 shrink-0">
                <FaCheckCircle className="inline w-4 h-4 mr-2 text-green-600" />
                Lampiran utama ada
              </span>
              <span className="text-sm font-semibold text-green-700 text-left flex-1"></span>
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
            <FileItem name="Transkrip_Nilai.pdf" size="245 KB" />
            <FileItem name="KTM_Scan.jpg" size="1.2 MB" />
            <FileItem name="Sertifikat_Lomba.pdf" size="850 KB" />
          </div>
        </CardContent>
      </Card>

    </section>
  );
}