"use client";

import Image from "next/image";
import React from "react";
import { SignatureImage } from "@/components/ui/signature-image";
/* eslint-disable @next/next/no-img-element */

// Interface untuk konfigurasi pejabat penandatangan
interface LeadershipConfig {
    name: string;
    nip: string;
    jabatan: string;
}

interface SuratDocumentProps {
    nomorSurat?: string;
    showSignature?: boolean;
    signaturePath?: string | null;
    showStamp?: boolean;
    stampUrl?: string | null;
    leadershipConfig?: LeadershipConfig;
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
    qrCodeUrl?: string;
}

// Default values untuk fallback jika config tidak tersedia
const DEFAULT_LEADERSHIP: LeadershipConfig = {
    name: "[Nama Pejabat]",
    nip: "[NIP]",
    jabatan: "[Jabatan]",
};

export function SuratDocument({
    nomorSurat,
    showSignature = false,
    signaturePath,
    showStamp = false,
    stampUrl,
    leadershipConfig,
    data,
    qrCodeUrl,
}: SuratDocumentProps) {
    // Gunakan config dari database atau fallback ke default
    const leadership = leadershipConfig || DEFAULT_LEADERSHIP;
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
        keperluan: "",
        tahunAkademik: autoAcademicYear,
        publishedAt: undefined,
    };

    const finalData = { ...defaultData, ...data };

    // Use programStudi for Jurusan if available
    const jurusanDisplay = finalData.programStudi || finalData.jurusan;

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl pt-[2.8cm] pb-[2cm] pl-[3cm] pr-[2.5cm] flex flex-col font-serif text-black border border-gray-100 mx-auto overflow-hidden print:shadow-none print:border-none print:m-0 print:w-[210mm] print:h-[295mm] print:overflow-hidden page-break-after-avoid relative">
            {/* Kop Surat */}
            <div className="flex items-start gap-3 border-b-2 border-black pb-3 mb-8">
                <div className="w-21.25 shrink-0">
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
                    <p className="text-blue-900 text-[15.5px] font-bold mt-0.5">
                        UNIVERSITAS DIPONEGORO
                    </p>
                    <p className="text-blue-900 text-[14.5px] font-bold uppercase">
                        FAKULTAS SAINS DAN MATEMATIKA
                    </p>
                </div>
                <div className="text-right text-[8.5px] font-normal leading-[1.3] w-40">
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
                <div className="text-[11.5px] space-y-3.5 leading-[1.6]">
                    <p className="text-justify">
                        Dekan Fakultas Sains dan Matematika Universitas
                        Diponegoro dengan ini menerangkan :
                    </p>

                    <div className="grid grid-cols-[145px_10px_1fr] gap-x-0 gap-y-0.75 pl-12 text-[11.5px]">
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

                    <div className="grid grid-cols-[145px_10px_1fr] gap-x-0 gap-y-0.75 pl-12 text-[11.5px]">
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
                            Pengajuan Beasiswa {finalData.keperluan}
                        </span>
                    </p>

                    <p className="text-justify">
                        Serta menerangkan bahwa mahasiswa yang bersangkutan:
                    </p>

                    <div className="space-y-0.75 text-[11.5px] pl-12">
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
                        <div className="w-fit min-w-55">
                            <div className="flex justify-between items-end font-normal">
                                <span>Semarang,</span>
                                <span className="font-bold">
                                    {showSignature &&
                                        (finalData.publishedAt ||
                                            new Date().toLocaleDateString(
                                                "id-ID",
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                },
                                            ))}
                                </span>
                            </div>
                            <p className="text-left mt-0.5">a.n. Dekan</p>
                            <p className="text-left">{leadership.jabatan}</p>

                            <div className="h-21.25 flex items-center justify-start relative mt-1 pl-4">
                                {showSignature && (
                                    <div className="relative w-37.5 h-17.5">
                                        <SignatureImage
                                            src={
                                                signaturePath ||
                                                "/assets/signature-dummy.png"
                                            }
                                            alt="Signature"
                                            className="object-contain mix-blend-multiply opacity-90 w-full h-full"
                                        />
                                    </div>
                                )}
                                {showStamp && stampUrl && (
                                    <div className="absolute -left-5 top-2.5 w-27.5 h-27.5 opacity-70 pointer-events-none">
                                        <img
                                            src={stampUrl}
                                            alt="Stamp"
                                            className="w-full h-full object-contain mix-blend-multiply"
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="font-bold underline decoration-1 underline-offset-2 text-left whitespace-nowrap">
                                {leadership.name}
                            </p>
                            <p className="text-left mt-0.5">
                                NIP. {leadership.nip}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
                <div className="absolute bottom-[2cm] left-[3cm] print:bottom-[2cm] print:left-[3cm]">
                    <Image
                        src={qrCodeUrl}
                        alt="QR Code Verification"
                        width={60}
                        height={60}
                        className="object-contain"
                    />
                </div>
            )}
        </div>
    );
}
