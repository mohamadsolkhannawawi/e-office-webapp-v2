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

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Jenis Surat</Label>
              <Input
              value="Surat Rekomendasi Mahasiswa"
              readOnly
              className="h-11 bg-gray-100 text-gray-500 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Nama Beasiswa</Label>
              <Input 
                placeholder="Masukkan nama beasiswa" 
                className="h-11 bg-white border-gray-300"
              />
            </div>

          </form>
        </CardContent>
      </Card>
    </section>
  );
}