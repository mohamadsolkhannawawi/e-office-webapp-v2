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
        semester?: string;
        ipk?: string;
        ips?: string;
        keperluan?: string;
    };
}

export function SuratDocument({
    nomorSurat,
    showSignature = false,
    signaturePath,
    showStamp = false,
    data,
}: SuratDocumentProps) {
    const defaultData = {
        nama: "Ahmad Syaifullah",
        nim: "24060121120001",
        tempatLahir: "Blora",
        tanggalLahir: "18 Maret 2006",
        noHp: "0812321312312",
        jurusan: "Informatika",
        semester: "8",
        ipk: "3.34",
        ips: "3.34",
        keperluan: "Pengajuan Beasiswa Djarum Foundation",
    };

    const finalData = { ...defaultData, ...data };

    return (
        <div className="w-[800px] bg-white shadow-2xl p-16 min-h-[1100px] flex flex-col font-serif text-slate-900 border border-gray-100">
            {/* Kop Surat */}
            <div className="flex items-start gap-4 border-b-[3px] border-black pb-4 mb-8">
                <div className="w-24 shrink-0">
                    <Image
                        src="/assets/undip-logo.png"
                        alt="Logo UNDIP"
                        width={100}
                        height={100}
                        className="object-contain"
                    />
                </div>
                <div className="flex-1 text-center font-bold">
                    <p className="text-blue-800 text-[13px] tracking-tight">
                        KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                    </p>
                    <p className="text-blue-800 text-[18px] leading-tight mt-0.5">
                        UNIVERSITAS DIPONEGORO
                    </p>
                    <p className="text-blue-800 text-[18px] uppercase leading-tight">
                        Fakultas Sains dan Matematika
                    </p>
                    <div className="text-[11px] font-normal mt-2 text-slate-800 italic leading-tight">
                        <p>
                            Jalan Prof. Jacub Rais, Tembalang, Semarang, Kode
                            Pos 50275
                        </p>
                        <p>Telp. (024) 7474754 Fax (024) 7460033</p>
                        <p>
                            Laman: fsm.undip.ac.id Pos-el: fsm@live.undip.ac.id
                        </p>
                    </div>
                </div>
            </div>

            {/* Judul Surat */}
            <div className="text-center mb-10">
                <h3 className="font-bold underline text-[18px] tracking-widest decoration-1">
                    S U R A T R E K O M E N D A S I
                </h3>
                <p className="font-bold text-[14px] mt-1">
                    Nomor: &nbsp;
                    {nomorSurat || "......../UN7.F8.1/KM/....../2026"}
                </p>
            </div>

            {/* Isi Surat */}
            <div className="text-[14px] space-y-6 flex-1 text-justify leading-relaxed">
                <p>
                    Dekan Fakultas Sains dan Matematika Universitas Diponegoro
                    dengan ini menerangkan bahwa:
                </p>

                <div className="grid grid-cols-[180px_10px_1fr] gap-x-2 px-10">
                    <span>Nama</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.nama}</span>
                    <span>NIM</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.nim}</span>
                    <span>Tempat / Tgl Lahir</span> <span>:</span>{" "}
                    <span className="font-bold">
                        {finalData.tempatLahir}, {finalData.tanggalLahir}
                    </span>
                    <span>No HP</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.noHp}</span>
                </div>

                <p>
                    Pada semester berjalan tahun akademik 2025/2026 terdaftar
                    sebagai mahasiswa aktif pada:
                </p>

                <div className="grid grid-cols-[180px_10px_1fr] gap-x-2 px-10">
                    <span>Departemen/Jurusan</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.jurusan}</span>
                    <span>Semester</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.semester}</span>
                    <span>IPK</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.ipk}</span>
                    <span>IPS (Semester Terakhir)</span> <span>:</span>{" "}
                    <span className="font-bold">{finalData.ips}</span>
                </div>

                <p>
                    Surat rekomendasi ini dibuat untuk keperluan:{" "}
                    <span className="font-bold underline underline-offset-4">
                        {finalData.keperluan}
                    </span>
                    . Serta menerangkan bahwa mahasiswa yang bersangkutan:
                </p>

                <ul className="list-decimal pl-14 space-y-1">
                    <li>
                        Tidak sedang mengajukan atau menerima beasiswa dari
                        instansi lain;
                    </li>
                    <li>
                        Berstatus aktif kuliah dan berkelakuan baik di
                        lingkungan kampus;
                    </li>
                    <li>IPK dan IPS memenuhi syarat yang telah ditentukan.</li>
                </ul>

                <p>
                    Demikian surat rekomendasi ini dibuat untuk dapat
                    dipergunakan sebagaimana mestinya.
                </p>
            </div>

            {/* Tanda Tangan */}
            <div className="mt-12 ml-auto w-80 text-[14px] relative">
                <p>Semarang, 18 Januari 2026</p>
                <p className="mt-1">a.n. Dekan</p>
                <p>Wakil Dekan Akademik dan Kemahasiswaan,</p>

                <div className="h-32 flex items-center justify-center relative">
                    {showSignature && (
                        <div className="relative w-48 h-24">
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
                        <div className="absolute left-[-40px] top-4 w-32 h-32 opacity-80 pointer-events-none">
                            <Image
                                src="/assets/stamp-dummy.png"
                                alt="Stamp"
                                fill
                                className="object-contain mix-blend-multiply"
                            />
                        </div>
                    )}
                </div>

                <p className="font-bold underline decoration-1">
                    Prof. Dr. Ngadiwiyana, S.Si., M.Si.
                </p>
                <p>NIP. 196906201999031002</p>
            </div>
        </div>
    );
}
