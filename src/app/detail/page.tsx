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
                            <h1 className="text-2xl font-bold text-gray-800">
                                Detail Surat
                            </h1>
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

                        {/* Actions intentionally removed on detail page */}
                    </div>
                </main>
            </div>
        </div>
    );
}
