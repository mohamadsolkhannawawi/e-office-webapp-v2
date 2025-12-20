import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FaCheckCircle } from "react-icons/fa";

export function Review() {
  return (
    <section aria-label="Review Pengajuan">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Review Surat</h2>
        <p className="text-gray-500 text-sm mt-1">
          Mohon periksa kembali seluruh data yang telah Anda masukkan sebelum mengajukan surat.
        </p>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-8">
          
          {/* BAGIAN 1: IDENTITAS */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Identitas Pengaju</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm mb-6">
            <div>
                <span className="block text-gray-500 text-xs">Nama Lengkap</span>
                <span className="font-medium text-gray-800">Ahmad Syaifullah</span>
            </div>
            <div>
                <span className="block text-gray-500 text-xs">NIM</span>
                <span className="font-medium text-gray-800">24060121130089</span>
            </div>
            <div>
                <span className="block text-gray-500 text-xs">Departemen</span>
                <span className="font-medium text-gray-800">Informatika</span>
            </div>
            <div>
                <span className="block text-gray-500 text-xs">No. HP</span>
                <span className="font-medium text-gray-800">081234567890</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* BAGIAN 2: DETAIL SURAT */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Detail Surat Pengajuan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm mb-6">
             <div>
                <span className="block text-gray-500 text-xs">Jenis Surat</span>
                <span className="font-medium text-gray-800">Surat Rekomendasi Beasiswa</span>
            </div>
            <div>
                <span className="block text-gray-500 text-xs">Nama Beasiswa</span>
                <span className="font-medium text-gray-800">Beasiswa Djarum Foundation</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* BAGIAN 3: CHECKLIST KONFIRMASI (Kotak Hijau di Gambar) */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
             <h4 className="font-bold text-green-800 text-sm mb-2">Checklist Kesiapan</h4>
             <ul className="space-y-2">
               <li className="flex items-center gap-2 text-sm text-green-700">
                  <FaCheckCircle /> Data diri lengkap
               </li>
               <li className="flex items-center gap-2 text-sm text-green-700">
                  <FaCheckCircle /> Lampiran utama tersedia
               </li>
             </ul>
          </div>

        </CardContent>
      </Card>
    </section>
  );
}