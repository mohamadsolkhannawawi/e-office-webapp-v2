import React from 'react';

// Import komponen Shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function DetailPengajuan() {
  return (
    <section aria-label="Detail Pengajuan">
      
      {/* Header Bagian */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Detail Pengajuan</h2>
        <p className="text-gray-500 text-sm mt-1">
          Lengkapi detail utama dari surat yang akan diajukan.
        </p>
      </div>

      {/* Kartu Form */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input 1: Dropdown Jenis Surat */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Jenis Surat</Label>
              <Select>
                <SelectTrigger className="h-11 bg-white border-gray-300">
                  <SelectValue placeholder="Pilih Jenis Surat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rekomendasi">Surat Rekomendasi Beasiswa</SelectItem>
                  <SelectItem value="keterangan">Surat Keterangan Aktif Kuliah</SelectItem>
                  <SelectItem value="izin">Surat Izin PKL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input 2: Nama Beasiswa */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Nama Beasiswa</Label>
              <Input 
                placeholder="Masukkan nama beasiswa" 
                className="h-11 bg-white border-gray-300"
              />
            </div>

            {/* Input Tambahan (Opsional/Placeholder layout) */}
            {/* Kalau nanti ada input tambahan, taruh di sini */}
            
          </form>
        </CardContent>
      </Card>
    </section>
  );
}