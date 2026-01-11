import React, { Dispatch, SetStateAction } from "react";

import type { FormDataType } from "@/types/form";

interface InfoPengajuanProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}
import { BsCalendar } from "react-icons/bs";

// Import komponen Shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// --- SUB-COMPONENT: FormField (Helper agar kode tidak berulang) ---
interface FieldProps {
    label: string;
    name?: string;
    value?: string;
    placeholder?: string;
    readOnly?: boolean;
    icon?: React.ReactNode;
    className?: string; // Untuk custom width (misal col-span-2)
    onChange?: (val: string) => void;
}

function FormField({
    label,
    value,
    placeholder,
    readOnly = false,
    icon,
    className,
    name,
    onChange,
}: FieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label className="text-sm font-semibold text-gray-700">
                {label}
            </Label>
            <div className="relative">
                <Input
                    value={value}
                    name={name}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    onChange={(e) => onChange && onChange(e.target.value)}
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

export function InfoPengajuan({ data, setData }: InfoPengajuanProps) {
    // controlled inputs: gunakan data dan setData untuk binding input
    return (
        <section aria-label="Informasi Identitas">
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            name="namaLengkap"
                            label="Nama Lengkap"
                            value={data.namaLengkap as string}
                            placeholder="Contoh: Ahmad Syaifullah"
                            onChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    namaLengkap: val,
                                }))
                            }
                        />
                        <FormField
                            name="role"
                            label="Role"
                            value={data.role as string}
                            placeholder="Contoh: Mahasiswa"
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, role: val }))
                            }
                        />

                        <FormField
                            name="nim"
                            label="NIM"
                            value={data.nim as string}
                            placeholder="Contoh: 24060121130089"
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, nim: val }))
                            }
                        />
                        <FormField
                            name="email"
                            label="Email"
                            value={data.email as string}
                            placeholder="Contoh: ahmadsyaifullah@students.undip.ac.id"
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, email: val }))
                            }
                        />

                        <FormField
                            name="departemen"
                            label="Departemen"
                            value={data.departemen as string}
                            placeholder="Contoh: Informatika"
                            onChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    departemen: val,
                                }))
                            }
                        />
                        <FormField
                            name="programStudi"
                            label="Program Studi"
                            value={data.programStudi as string}
                            placeholder="Contoh: S1 - Informatika"
                            onChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    programStudi: val,
                                }))
                            }
                        />

                        <FormField
                            name="tempatLahir"
                            label="Tempat Lahir"
                            value={data.tempatLahir as string}
                            placeholder="Contoh: Blora"
                            onChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    tempatLahir: val,
                                }))
                            }
                        />
                        <FormField
                            name="tanggalLahir"
                            label="Tanggal Lahir"
                            value={data.tanggalLahir as string}
                            placeholder="Contoh: 03/18/2006"
                            icon={<BsCalendar />}
                            onChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    tanggalLahir: val,
                                }))
                            }
                        />

                        <FormField
                            name="noHp"
                            label="No. HP"
                            value={data.noHp as string}
                            placeholder="Contoh: 081234567890"
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, noHp: val }))
                            }
                        />
                        <FormField
                            name="ipk"
                            label="IPK"
                            value={data.ipk as string}
                            placeholder="Masukkan IPK"
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, ipk: val }))
                            }
                        />

                        <FormField
                            name="ips"
                            label="IPS"
                            value={data.ips as string}
                            placeholder="Masukkan IPS"
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, ips: val }))
                            }
                        />
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
