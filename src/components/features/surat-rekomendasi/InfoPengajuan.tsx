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
                    className={`h-11 ${
                        readOnly
                            ? "bg-gray-100 text-gray-500 border-gray-200"
                            : "bg-white border-gray-300"
                    }`}
                />
                {icon && (
                    <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

export function InfoPengajuan() {
    return (
        <section aria-label="Informasi Identitas">

            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Nama Lengkap"
                            placeholder="Contoh: Ahmad Syaifullah"
                        />
                        <FormField
                            label="Role"
                            placeholder="Contoh: Mahasiswa"
                        />

                        <FormField
                            label="NIM"
                            placeholder="Contoh: 24060121130089"
                        />
                        <FormField
                            label="Email"
                            placeholder="Contoh: ahmadsyaifullah@students.undip.ac.id"
                        />

                        <FormField
                            label="Departemen"
                            placeholder="Contoh: Informatika"
                        />
                        <FormField
                            label="Program Studi"
                            placeholder="Contoh: S1 - Informatika"
                        />

                        <FormField
                            label="Tempat Lahir"
                            placeholder="Contoh: Blora"
                        />
                        <FormField
                            label="Tanggal Lahir"
                            placeholder="Contoh: 03/18/2006"
                            icon={<BsCalendar />}
                        />

                        <FormField
                            label="No. HP"
                            placeholder="Contoh: 081234567890"
                        />
                        <FormField label="IPK" placeholder="Masukkan IPK" />

                        <FormField label="IPS" placeholder="Masukkan IPS" />
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
