"use client";

import { ChevronRight, Download, Eye, EditNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    IdentitasPengaju,
    DetailSuratPengajuan,
    RiwayatSurat,
} from "@/components/features/detail-surat";

// Custom Icon for EditNote if not found
const EditNoteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

export default function DetailSuratProsesPage() {
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
                    {/* Identitas Pengaju */}
                    <IdentitasPengaju data={identitasData as any} />

                    {/* Detail Surat Pengajuan */}
                    <DetailSuratPengajuan data={detailSuratData as any} />

                    {/* Lampiran Section */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            Lampiran
                        </h2>
                        <div className="space-y-4">
                            {/* KTM Attachment */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <span className="text-lg font-bold text-slate-800">
                                        KTM.jpg
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
                                </button>
                                <div className="px-6 pb-6 pt-2">
                                    <div className="w-full bg-[#6A8E7F] rounded-lg p-12 flex items-center justify-center overflow-hidden">
                                        <div className="bg-white shadow-xl max-w-sm w-full aspect-[3/4] p-8 transform rotate-1 transition-transform hover:rotate-0 flex flex-col gap-4">
                                            <div className="h-4 bg-gray-100 w-1/2 mx-auto mb-6"></div>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-gray-50 w-full"></div>
                                                <div className="h-2 bg-gray-50 w-full"></div>
                                                <div className="h-2 bg-gray-50 w-3/4"></div>
                                            </div>
                                            <div className="flex-1"></div>
                                            <div className="h-12 w-12 bg-gray-50 rounded-full self-end border-2 border-gray-100"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KHS Attachment */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <span className="text-lg font-bold text-slate-800">
                                        KHS.pdf
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
                                </button>
                                <div className="px-6 pb-6 pt-2">
                                    <div className="w-full bg-[#6A8E7F] rounded-lg p-12 flex items-center justify-center overflow-hidden">
                                        <div className="bg-white shadow-xl max-w-sm w-full aspect-[3/4] p-8 transform -rotate-1 transition-transform hover:rotate-0 flex flex-col gap-4">
                                            <div className="h-4 bg-gray-100 w-1/2 mx-auto mb-6"></div>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-gray-50 w-full"></div>
                                                <div className="h-2 bg-gray-50 w-full"></div>
                                                <div className="h-2 bg-gray-50 w-3/4"></div>
                                            </div>
                                            <div className="flex-1"></div>
                                            <div className="h-10 w-1/4 bg-gray-100 rounded self-end"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Aksi Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">
                            Aksi
                        </h2>
                        <div className="space-y-3">
                            <Link href="/mahasiswa/surat/proses/preview/dummy-id">
                                <Button className="w-full bg-slate-500 hover:bg-slate-600 text-white font-medium py-6 rounded-lg flex items-center justify-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                            </Link>
                            <Button className="w-full bg-undip-blue hover:bg-sky-700 text-white font-medium py-6 rounded-lg flex items-center justify-center gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-lg flex items-center justify-center gap-2">
                                <EditNoteIcon />
                                Revisi
                            </Button>
                        </div>
                    </div>

                    {/* Timeline Card */}
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
