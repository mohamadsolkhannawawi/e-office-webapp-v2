import React, { Dispatch, SetStateAction, useState } from "react";

import type { FormDataType } from "@/types/form";

interface DetailPengajuanProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                Jenis Surat
                            </Label>
                            <Input
                                value="Surat Rekomendasi Beasiswa"
                                readOnly
                                className="h-11 bg-gray-100 text-gray-500 border-gray-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                Nama Beasiswa
                            </Label>
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
                                className={`h-11 ${
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
