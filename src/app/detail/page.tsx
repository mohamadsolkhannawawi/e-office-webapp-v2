"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  IdentitasPengaju,
  DetailSuratPengajuan,
  LampiranSurat,
  RiwayatSurat,
} from "@/components/features/detail-surat";
import { useRouter } from "next/navigation";

export default function DetailSuratPage() {
  const router = useRouter();

  const handleKembali = () => {
    router.back();
  };

  const handleSimpanDraft = () => {
    console.log("Simpan draft...");
  };

  const handleAjukanSurat = () => {
    console.log("Ajukan surat...");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Detail Surat</h1>
              <p className="text-sm text-gray-600 mt-1">
                Persyaratan • Detail Surat
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <IdentitasPengaju />
                <DetailSuratPengajuan />
                <LampiranSurat />
              </div>

              <div className="lg:col-span-1">
                <RiwayatSurat />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleKembali}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6 h-11"
              >
                Kembali
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleSimpanDraft}
                  className="text-[#007bff] border-[#007bff]/50 hover:bg-blue-50 h-11 px-6"
                >
                  Simpan Draft
                </Button>

                <Button
                  onClick={handleAjukanSurat}
                  className="bg-[#007bff] hover:bg-blue-700 text-white h-11 px-8 font-medium shadow-sm shadow-blue-200"
                >
                  Ajukan Surat
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}