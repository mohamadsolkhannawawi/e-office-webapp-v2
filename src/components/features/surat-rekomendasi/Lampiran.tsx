import React from 'react';
import { FaCloudUploadAlt, FaFilePdf } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function Lampiran() {
  return (
    <section aria-label="Upload Lampiran">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Lampiran</h2>
        <p className="text-gray-500 text-sm mt-1">
          Lampirkan dokumen pendukung yang diperlukan.
        </p>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-8 space-y-8">
          
          {/* UPLOAD 1: Lampiran Utama (Wajib) */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-800">
              Lampiran Utama <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 -mt-2">
              Wajib. Unggah minimal 1 dokumen pendukung utama. Format: PDF, JPG, PNG. Maks: 5MB/file.
            </p>

            {/* Area Drag & Drop */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer group">
              <div className="bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] group-hover:scale-110 transition-transform">
                 <FaCloudUploadAlt size={28} />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Seret & lepas atau <span className="text-[#007bff] font-bold">pilih file</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">untuk diunggah</p>
            </div>
          </div>

          {/* UPLOAD 2: Lampiran Tambahan (Opsional) */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-800">Lampiran Tambahan</Label>
            <p className="text-xs text-gray-500 -mt-2">
              Opsional. Tambahkan dokumen pendukung lainnya jika diperlukan.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer">
              <div className="bg-gray-100 p-3 rounded-full mb-3 text-gray-500">
                 <FaFilePdf size={20} />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Seret & lepas atau <span className="text-gray-900 font-bold">pilih file</span>
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </section>
  );
}