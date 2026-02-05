import React, { Dispatch, SetStateAction, useState } from "react";

import type { FormDataType } from "@/types/form";

function HelperButton({ text }: { text: string }) {
    const [showHelper, setShowHelper] = useState(false);

    return (
        <div className="relative flex items-center">
            <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                onBlur={() => setTimeout(() => setShowHelper(false), 150)}
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
            >
                <CircleAlert className="w-4 h-4" />
            </button>
            {showHelper && (
                <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-black rounded-xl shadow-lg text-xs font-normal text-white animate-in fade-in-0 zoom-in-95 duration-150">
                    {text}
                </div>
            )}
        </div>
    );
}

interface DetailPengajuanProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CircleAlert } from "lucide-react";
import { validateNamaBeasiswa } from "@/utils/validations/suratRekomendasi";

export function DetailPengajuan({ data, setData }: DetailPengajuanProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleValidation = (field: string, value: unknown) => {
        let result;
        if (field === "namaBeasiswa") {
            result = validateNamaBeasiswa(value);
        } else {
            return;
        }

        setErrors((prev) => ({
            ...prev,
            [field]: result.valid ? "" : result.errors[0] || "",
        }));
    };

    const validateAllFields = React.useCallback(() => {
        const result = validateNamaBeasiswa(data.namaBeasiswa);

        if (!result.valid) {
            setErrors({ namaBeasiswa: result.errors[0] || "" });
            return false;
        }

        setErrors({});
        return true;
    }, [data.namaBeasiswa]);

    React.useEffect(() => {
        const customWindow = window as unknown as {
            __validateDetailPengajuan?: () => boolean;
        };
        customWindow.__validateDetailPengajuan = validateAllFields;
        return () => {
            delete customWindow.__validateDetailPengajuan;
        };
    }, [validateAllFields]);

    return (
        <section aria-label="Detail Pengajuan">
            <Card className="border-none shadow-sm bg-white rounded-3xl">
                <CardContent className="p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold text-gray-700">Jenis Surat</Label>
                                <HelperButton text="Jenis surat yang akan Anda ajukan (tidak dapat diubah)" />
                            </div>
                            <Input
                                value="Surat Rekomendasi Beasiswa"
                                readOnly
                                className="h-11 rounded-3xl bg-gray-100 text-gray-500 border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold text-gray-700">Nama Beasiswa</Label>
                                <HelperButton text="Nama lengkap program beasiswa yang Anda ajukan (contoh: Beasiswa Unggulan Kemendikbud 2024)" />
                            </div>
                            <Input
                                name="namaBeasiswa"
                                value={data.namaBeasiswa as string}
                                placeholder="Masukkan nama beasiswa"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setData((prev) => ({
                                        ...prev,
                                        namaBeasiswa: val,
                                    }));
                                    if (errors.namaBeasiswa) {
                                        handleValidation("namaBeasiswa", val);
                                    }
                                }}
                                onBlur={() =>
                                    handleValidation(
                                        "namaBeasiswa",
                                        data.namaBeasiswa,
                                    )
                                }
                                className={`h-11 rounded-3xl ${
                                    errors.namaBeasiswa
                                        ? "bg-white border-red-500 focus-visible:ring-red-500"
                                        : "bg-white border-gray-300"
                                }`}
                            />
                            {errors.namaBeasiswa && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.namaBeasiswa}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
