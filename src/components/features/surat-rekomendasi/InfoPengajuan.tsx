import React from "react";
import { BsCalendar } from "react-icons/bs";

// Import komponen Shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// --- SUB-COMPONENT: FormField (Helper agar kode tidak berulang) ---
interface FieldProps {
    label: string;
    value?: string;
    placeholder?: string;
    readOnly?: boolean;
    icon?: React.ReactNode;
    className?: string; // Untuk custom width (misal col-span-2)
}

function FormField({
    label,
    value,
    placeholder,
    readOnly = false,
    icon,
    className,
}: FieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label className="text-sm font-semibold text-gray-700">
                {label}
            </Label>
            <div className="relative">
                <Input
                    defaultValue={value}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    // Logika Style: Kalau ReadOnly background abu-abu, kalau bisa diedit putih
                    className={`h-11 ${
                        readOnly
                            ? "bg-gray-100 text-gray-500 border-gray-200"
                            : "bg-white border-gray-300"
                    }`}
                />
                {/* Jika ada icon (misal kalender), tampilkan di kanan */}
                {icon && (
                    <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- KOMPONEN UTAMA ---
export function InfoPengajuan() {
    return (
        <section aria-label="Informasi Identitas">
            {/* Judul Bagian */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    Identitas Pemohon
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Data berikut diisi secara otomatis berdasarkan data Anda.
                    Mohon periksa kembali.
                </p>
            </div>

            {/* Kartu Form */}
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* --- BARIS 1 (Otomatis) --- */}
                        {/* --- BARIS 1 (Editable) --- */}
                        <FormField
                            label="Nama Lengkap"
                            placeholder="Contoh: Ahmad Syaifullah"
                        />
                        <FormField
                            label="Role"
                            placeholder="Contoh: Mahasiswa"
                        />

                        {/* --- BARIS 2 (Otomatis) --- */}
                        {/* --- BARIS 2 (Editable) --- */}
                        <FormField
                            label="NIM"
                            placeholder="Contoh: 24060121130089"
                        />
                        <FormField
                            label="Email"
                            placeholder="Contoh: ahmadsyaifullah@students.undip.ac.id"
                        />

                        {/* --- BARIS 3 (Otomatis) --- */}
                        {/* --- BARIS 3 (Editable) --- */}
                        <FormField
                            label="Departemen"
                            placeholder="Contoh: Informatika"
                        />
                        <FormField
                            label="Program Studi"
                            placeholder="Contoh: S1 - Informatika"
                        />

                        {/* --- BARIS 4 (Otomatis + Icon) --- */}
                        {/* --- BARIS 4 (Editable + Icon) --- */}
                        <FormField
                            label="Tempat Lahir"
                            placeholder="Contoh: Blora"
                        />
                        <FormField
                            label="Tanggal Lahir"
                            placeholder="Contoh: 03/18/2006"
                            icon={<BsCalendar />}
                        />

                        {/* --- BARIS 5 (EDITABLE / BISA DIISI) --- */}
                        <FormField
                            label="No. HP"
                            placeholder="Contoh: 081234567890"
                        />
                        <FormField label="IPK" placeholder="Masukkan IPK" />

                        {/* --- BARIS 6 (Half Width) --- */}
                        <FormField label="IPS" placeholder="Masukkan IPS" />
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
