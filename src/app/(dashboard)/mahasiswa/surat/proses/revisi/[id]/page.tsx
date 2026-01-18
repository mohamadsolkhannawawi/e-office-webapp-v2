"use client";

import { ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    RiwayatSurat,
    DetailRevisi,
} from "@/components/features/detail-surat";

export default function DetailRevisiPage() {
    // Dummy data to match the provided HTML/Design
    const identitasData = {
        namaLengkap: "Ahmad Syaifullah",
        nimNip: "24060121120001",
        email: "ahmadsyaifullah@students.undip.ac.id",
        departemen: "Informatika",
        programStudi: "Informatika",
        tempatLahir: "Blora",
        tanggalLahir: "03/18/2006",
        noHp: "089123141241412412",
        ipk: "3.9",
        ips: "3.8",
        sks: "100",
    };

    const detailSuratData = {
        jenisSurat: "SRB/ Surat Rekomendasi Beasiswa",
        keperluan: "Beasiswa Djarum Foundation",
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span>Persuratan</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Detail Surat</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Detail Revisi Section */}
                    <DetailRevisi
                        checker="Supervisor Akademik"
                        comment="IPK-mu tidak sesuai dengan transkrip nilai"
                    />

                    {/* Identitas Pengaju */}
                    <IdentitasPengaju data={identitasData as any} />

                    {/* Detail Surat Pengajuan */}
                    <DetailSuratPengajuan data={detailSuratData as any} />

                    {/* Lampiran */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-slate-800">
                                Lampiran
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* KTM Lampiran */}
                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <span className="font-bold text-sm text-slate-700">
                                        KTM.jpg
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                                </button>
                                <div className="p-8 bg-gray-100 flex justify-center">
                                    <div className="bg-emerald-600/80 p-12 rounded shadow-inner max-w-sm w-full flex justify-center items-center">
                                        <div className="bg-white shadow-xl p-6 w-full aspect-3/4 flex flex-col gap-3 rounded-sm">
                                            <div className="h-3 w-1/3 bg-gray-200 rounded mb-4"></div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="flex-1"></div>
                                            <div className="h-12 w-12 bg-gray-100 rounded-full self-end border-2 border-gray-50"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KHS Lampiran */}
                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <span className="font-bold text-sm text-slate-700">
                                        KHS.pdf
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                                </button>
                                <div className="p-8 bg-gray-100 flex justify-center">
                                    <div className="bg-emerald-600/80 p-12 rounded shadow-inner max-w-sm w-full flex justify-center items-center">
                                        <div className="bg-white shadow-xl p-8 w-full aspect-3/4 flex flex-col gap-4 rounded-sm">
                                            <div className="h-3 w-1/2 bg-gray-200 rounded mb-6 mx-auto"></div>
                                            <div className="space-y-3">
                                                <div className="h-2 w-full bg-gray-50 rounded"></div>
                                                <div className="h-2 w-full bg-gray-50 rounded"></div>
                                                <div className="h-2 w-full bg-gray-50 rounded"></div>
                                                <div className="h-2 w-full bg-gray-50 rounded"></div>
                                            </div>
                                            <div className="flex-1"></div>
                                            <div className="h-2 w-1/4 bg-gray-200 rounded self-end"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Button className="w-full bg-undip-blue hover:bg-sky-700 text-white font-bold py-7 rounded shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        <Send className="h-4 w-4" />
                        Revisi
                    </Button>

                    <RiwayatSurat
                        riwayat={[
                            {
                                role: "Admin Surat",
                                status: "Menunggu Verifikasi",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Supervisor Akademik",
                                status: "Verifikasi Supervisor Akademik",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                            {
                                role: "Mahasiswa",
                                status: "Surat Diajukan",
                                date: "09 Desember 2025",
                                time: "00:58:49",
                                catatan: "Tidak ada catatan",
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
