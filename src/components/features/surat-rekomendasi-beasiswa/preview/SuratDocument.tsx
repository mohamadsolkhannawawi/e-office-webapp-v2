"use client";

import Image from "next/image";
import React from "react";

interface SuratDocumentProps {
    nomorSurat?: string;
    showSignature?: boolean;
    signaturePath?: string | null;
    showStamp?: boolean;
    data?: {
        nama?: string;
        nim?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        noHp?: string;
        jurusan?: string;
        programStudi?: string;
        semester?: string;
        ipk?: string;
        ips?: string;
        keperluan?: string;
        tahunAkademik?: string;
        publishedAt?: string;
    };
}

export function SuratDocument({
    nomorSurat,
    showSignature = false,
    signaturePath,
    showStamp = false,
    data,
}: SuratDocumentProps) {
    // Calculate Academic Year automatically
    const date = new Date();
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    // If month is July (6) or later, it's the start of a new academic year (e.g., 2024/2025)
    // If before July, it's the second semester of the current academic cycle (e.g., 2023/2024)
    const academicYearStart = month >= 6 ? year : year - 1;
    const academicYearEnd = academicYearStart + 1;
    const autoAcademicYear = `${academicYearStart}/${academicYearEnd}`;

    const defaultData = {
        nama: "…………………………….",
        nim: "…………………………….",
        tempatLahir: "…………………………….",
        tanggalLahir: "…………………………….",
        noHp: "…………………………….",
        jurusan: "…………………………….",
        programStudi: "…………………………….",
        semester: "…………………………….",
        ipk: "…………………………….",
        ips: "…………………………….",
        keperluan: "Pengajuan Beasiswa ………………………………",
        tahunAkademik: autoAcademicYear,
        publishedAt: undefined,
    };

    const finalData = { ...defaultData, ...data };

    // Use programStudi for Jurusan if available
    const jurusanDisplay = finalData.programStudi || finalData.jurusan;

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl pt-[2.8cm] pb-[2cm] pl-[3cm] pr-[2.5cm] flex flex-col font-serif text-black border border-gray-100 mx-auto overflow-hidden print:shadow-none print:border-none print:m-0 print:w-[210mm] print:h-[295mm] print:overflow-hidden page-break-after-avoid">
            {/* Kop Surat */}
            <div className="flex items-start gap-3 border-b-[2px] border-black pb-3 mb-8">
                <div className="w-[85px] shrink-0">
                    <Image
                        src="/assets/undip-logo.png"
                        alt="Logo UNDIP"
                        width={85}
                        height={85}
                        className="object-contain"
                    />
                </div>
                <div className="flex-1 text-left font-bold leading-[1.15]">
                    <p className="text-blue-900 text-[11px] tracking-tight font-semibold">
                        KEMENTERIAN PENDIDIKAN TINGGI, SAINS,
                    </p>
                    <p className="text-blue-900 text-[11px] tracking-tight font-semibold">
                        DAN TEKNOLOGI
                    </p>
                    <p className="text-blue-900 text-[15.5px] font-bold mt-[2px]">
                        UNIVERSITAS DIPONEGORO
                    </p>
                    <p className="text-blue-900 text-[14.5px] font-bold uppercase">
                        FAKULTAS SAINS DAN MATEMATIKA
                    </p>
                </div>
                <div className="text-right text-[8.5px] font-normal leading-[1.3] w-[160px]">
                    <p className="text-slate-700">Jalan Prof. Jacub Rais</p>
                    <p className="text-slate-700">
                        Kampus Universitas Diponegoro
                    </p>
                    <p className="text-slate-700">
                        Tembalang, Semarang, Kode Pos 50275
                    </p>
                    <p className="text-slate-700">
                        Telp (024) 7474754 Fax (024) 76480690
                    </p>
                    <p className="text-slate-700">Laman: www.fsm.undip.ac.id</p>
                    <p className="text-slate-700">Pos-el: fsm(at)undip.ac.id</p>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col">
                {/* Judul Surat */}
                <div className="text-center mb-6">
                    <h3 className="font-bold underline text-[15px] tracking-[0.35em] decoration-1 underline-offset-[3px]">
                        SURAT-REKOMENDASI
                    </h3>
                    <p className="font-bold text-[12px] mt-2">
                        <span className="underline underline-offset-2 decoration-1">
                            Nomor:
                        </span>
                        <span className="ml-10">
                            {nomorSurat || "/UN7.F8.1/KM/……/20…"}
                        </span>
                    </p>
                </div>

                {/* Isi Surat */}
                <div className="text-[11.5px] space-y-[14px] leading-[1.6]">
                    <p className="text-justify">
                        Dekan Fakultas Sains dan Matematika Universitas
                        Diponegoro dengan ini menerangkan :
                    </p>

                    <div className="grid grid-cols-[145px_10px_1fr] gap-x-0 gap-y-[3px] pl-12 text-[11.5px]">
                        <span>Nama</span>
                        <span>:</span>
                        <span>{finalData.nama}</span>

                        <span>NIM</span>
                        <span>:</span>
                        <span>{finalData.nim}</span>

                        <span>Tempat / Tgl Lahir</span>
                        <span>:</span>
                        <span>
                            {finalData.tempatLahir}, {finalData.tanggalLahir}
                        </span>

                        <span>No HP</span>
                        <span>:</span>
                        <span>{finalData.noHp}</span>
                    </div>

                    <p className="text-justify">
                        Pada tahun akademik {finalData.tahunAkademik} terdaftar
                        sebagai mahasiswa Fakultas Sains dan Matematika
                        Universitas Diponegoro
                    </p>

                    <div className="grid grid-cols-[145px_10px_1fr] gap-x-0 gap-y-[3px] pl-12 text-[11.5px]">
                        <span>Jurusan</span>
                        <span>:</span>
                        <span>{jurusanDisplay}</span>

                        <span>Semester</span>
                        <span>:</span>
                        <span>{finalData.semester}</span>

                        <span>IPK</span>
                        <span>:</span>
                        <span>{finalData.ipk}</span>

                        <span>IPS (Semester {finalData.semester})</span>
                        <span>:</span>
                        <span>{finalData.ips}</span>
                    </div>

                    <p className="text-justify">
                        Surat rekomendasi ini dibuat untuk keperluan :{" "}
                        <span className="underline decoration-1 underline-offset-2">
                            {finalData.keperluan}
                        </span>
                    </p>

                    <p className="text-justify">
                        Serta menerangkan bahwa mahasiswa yang bersangkutan:
                    </p>

                    <div className="space-y-[3px] text-[11.5px] pl-12">
                        <p className="flex">
                            <span className="inline-block w-6">-</span>
                            <span className="flex-1">
                                Tidak sedang mengajukan atau menerima beasiswa
                                dari instansi lain
                            </span>
                        </p>
                        <p className="flex">
                            <span className="inline-block w-6">-</span>
                            <span className="flex-1">
                                Berstatus aktif kuliah
                            </span>
                        </p>
                        <p className="flex">
                            <span className="inline-block w-6">-</span>
                            <span className="flex-1">Berkelakuan baik</span>
                        </p>
                    </div>

                    <p className="text-justify">
                        Demikian untuk diketahui dan dipergunakan sebagaimana
                        mestinya.
                    </p>
                </div>

                {/* Tanda Tangan */}
                <div className="mt-12 text-[11.5px] relative">
                    <div className="w-full flex justify-end">
                        <div className="w-fit">
                            <div className="flex justify-between items-end font-normal">
                                <span>Semarang,</span>
                                <span className="font-bold">
                                    {showSignature &&
                                        (finalData.publishedAt
                                            ? new Date(finalData.publishedAt)
                                            : new Date()
                                        )
                                            .toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            .toUpperCase()}
                                </span>
                            </div>
                            <p className="text-left mt-[2px]">a.n. Dekan</p>
                            <p className="text-left">
                                Wakil Dekan Akademik dan Kemahasiswaan
                            </p>

                            <div className="h-[85px] flex items-center justify-start relative mt-1 pl-4">
                                {showSignature && (
                                    <div className="relative w-[150px] h-[70px]">
                                        <Image
                                            src={
                                                signaturePath ||
                                                "/assets/signature-dummy.png"
                                            }
                                            alt="Signature"
                                            fill
                                            className="object-contain mix-blend-multiply opacity-90"
                                        />
                                    </div>
                                )}
                                {showStamp && (
                                    <div className="absolute left-[-20px] top-[10px] w-[110px] h-[110px] opacity-70 pointer-events-none">
                                        <Image
                                            src="/assets/stamp-dummy.png"
                                            alt="Stamp"
                                            fill
                                            className="object-contain mix-blend-multiply"
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="font-bold underline decoration-1 underline-offset-2 text-left">
                                Prof. Dr. Ngadiwiyana, S.Si., M.Si.
                            </p>
                            <p className="text-left mt-[2px]">
                                NIP. 196906201999031002
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
