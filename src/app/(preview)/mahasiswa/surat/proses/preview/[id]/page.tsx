"use client";

import { ChevronLeft, Minus, Plus, Maximize2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Image assets mapping (to avoid broken paths)
const LOGO_UNDIP = "/assets/undip-logo.png";

export default function SuratPreviewPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const attributes = [
        { label: "Jenis Surat", value: "Surat Rekomendasi Beasiswa" },
        { label: "Keperluan", value: "Djarum" },
        { label: "Nama", value: "Ahmad Syaifullah" },
        { label: "NIM", value: "240601211200001" },
        { label: "Email", value: "ahmadsyaifullah@students.undip.ac.id" },
        { label: "Tempat Lahir", value: "Blora" },
        { label: "Tanggal Lahir", value: "03/18/2006" },
        { label: "No. HP", value: "0812321312312313" },
        { label: "Tahun Akademik", value: "2024" },
        { label: "Jurusan", value: "S1 - Informatika" },
        { label: "Semester", value: "8" },
        { label: "Departemen", value: "Informatika" },
        { label: "IPK", value: "3.34" },
        { label: "IPS", value: "3.34" },
    ];

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden">
            {/* Left Sidebar: Attributes */}
            <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto hidden md:block">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Preview
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Lengkapi dan cek kembali data sebelum dikirim ke
                            tujuan selanjutnya
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Info className="h-4 w-4 text-slate-400" />
                            <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
                                Atribut Surat
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {attributes.map((attr, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase">
                                        {attr.label}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {attr.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Document Preview */}
            <div className="flex-1 flex flex-col bg-slate-200 overflow-hidden relative">
                {/* Toolbar */}
                <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                            Pratinjau Surat
                        </span>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-100 rounded-md px-2 py-1">
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                            <Minus className="h-4 w-4 text-slate-600" />
                        </button>
                        <span className="text-xs font-bold text-slate-600 px-2 border-x border-slate-200">
                            100%
                        </span>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                            <Plus className="h-4 w-4 text-slate-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-500">
                            Halaman 1 dari 1
                        </span>
                        <Maximize2 className="h-4 w-4 text-slate-400 cursor-pointer" />
                    </div>
                </div>

                {/* Document Area */}
                <div className="flex-1 overflow-auto p-8 flex justify-center">
                    <div className="w-[800px] bg-white shadow-2xl p-16 min-h-[1100px] flex flex-col">
                        {/* Document Header */}
                        <div className="flex items-start gap-4 border-b-2 border-black pb-4 mb-8">
                            <div className="w-20 shrink-0">
                                <Image
                                    src="/assets/undip-logo.png"
                                    alt="Logo UNDIP"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 text-center font-bold">
                                <p className="text-blue-800 text-sm">
                                    KEMENTERIAN PENDIDIKAN TINGGI, SAINS,
                                </p>
                                <p className="text-blue-800 text-sm">
                                    DAN TEKNOLOGI
                                </p>
                                <p className="text-blue-800 text-lg">
                                    UNIVERSITAS DIPONEGORO
                                </p>
                                <p className="text-blue-800 text-lg uppercase leading-tight mt-1">
                                    Fakultas Sains dan Matematika
                                </p>
                                <div className="text-[10px] font-normal mt-2 text-blue-900 leading-tight">
                                    <p>Jalan Prof. Jacub Rais</p>
                                    <p>Tembalang, Semarang, Kode Pos 50275</p>
                                    <p>
                                        Telp. (024) 7474754 Fax (024) 76480890
                                    </p>
                                    <p>Laman: www.fsm.undip.ac.id</p>
                                    <p>Pos-el: fsm@fsm.undip.ac.id</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Title */}
                        <div className="text-center mb-8">
                            <h3 className="font-bold underline text-lg tracking-widest">
                                S U R A T R E K O M E N D A S I
                            </h3>
                            <p className="font-bold text-sm">
                                Nomor:
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/UN7.F8.1/KM/....../20...
                            </p>
                        </div>

                        {/* Document Content */}
                        <div className="text-sm space-y-6 flex-1">
                            <p>
                                Dekan Fakultas Sains dan Matematika Universitas
                                Diponegoro dengan ini menerangkan:
                            </p>

                            <div className="grid grid-cols-[150px_10px_1fr] gap-x-2 px-8">
                                <span>Nama</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                                <span>NIM</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                                <span>Tempat / Tgl Lahir</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                                <span>No HP</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                            </div>

                            <p>
                                Pada tahun akademik 20../20... terdaftar sebagai
                                mahasiswa Fakultas Sains dan Matematika
                                Universitas Diponegoro
                            </p>

                            <div className="grid grid-cols-[150px_10px_1fr] gap-x-2 px-8">
                                <span>Jurusan</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                                <span>Semester</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                                <span>IPK</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                                <span>IPS (Semester 2)</span> <span>:</span>{" "}
                                <span className="border-b border-dotted border-black">
                                    ....................................................
                                </span>
                            </div>

                            <p>
                                Surat rekomendasi ini dibuat untuk keperluan:{" "}
                                <span className="font-bold underline">
                                    Pengajuan Beasiswa
                                    ..........................
                                </span>
                            </p>
                            <p>
                                Serta menerangkan bahwa mahasiswa yang
                                bersangkutan:
                            </p>

                            <ul className="list-disc pl-10 space-y-1">
                                <li>
                                    Tidak sedang mengajukan atau menerima
                                    beasiswa dari instansi lain
                                </li>
                                <li>Berstatus aktif kuliah</li>
                                <li>Berkelakuan baik</li>
                            </ul>

                            <p>
                                Demikian untuk diketahui dan dipergunakan
                                sebagaimana mestinya.
                            </p>
                        </div>

                        {/* Signature Area */}
                        <div className="mt-12 ml-auto w-80 text-sm">
                            <p>Semarang,</p>
                            <p>a.n. Dekan</p>
                            <p>Wakil Dekan Akademik dan Kemahasiswaan</p>

                            <div className="h-24"></div>

                            <p className="font-bold underline">
                                Prof. Dr. Ngadiwiyana, S.Si., M.Si.
                            </p>
                            <p>NIP. 196906201999031002</p>
                        </div>
                    </div>
                </div>

                {/* Floating Footer Back Button */}
                <div className="absolute bottom-6 right-6 flex justify-end gap-4">
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 border-gray-200 px-8 py-6 h-12 shadow-md font-bold text-slate-700 rounded-lg"
                    >
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    );
}
