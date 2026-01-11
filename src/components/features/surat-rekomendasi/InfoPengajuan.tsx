import React, { Dispatch, SetStateAction, useState } from "react";
import type { FormDataType } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
    validateNamaLengkap,
    validateRole,
    validateNIM,
    validateEmail,
    validateDepartemen,
    validateProgramStudi,
    validateTempatLahir,
    validateTanggalLahir,
    validateNoHp,
    validateIPK,
    validateIPS,
} from "@/utils/validations/suratRekomendasi";

interface InfoPengajuanProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}

interface FieldProps {
    label: string;
    name?: string;
    value?: string;
    placeholder?: string;
    readOnly?: boolean;
    icon?: React.ReactNode;
    className?: string;
    onChange?: (val: string) => void;
    onBlur?: () => void;
    error?: string;
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
    onBlur,
    error,
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
                    onBlur={onBlur}
                    className={`h-11 ${
                        readOnly
                            ? "bg-gray-100 text-gray-500 border-gray-200"
                            : error
                            ? "bg-white border-red-500 focus-visible:ring-red-500"
                            : "bg-white border-gray-300"
                    }`}
                />
                {icon && (
                    <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}

export function InfoPengajuan({ data, setData }: InfoPengajuanProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleValidation = (field: string, value: unknown) => {
        let result;
        switch (field) {
            case "namaLengkap":
                result = validateNamaLengkap(value);
                break;
            case "role":
                result = validateRole(value);
                break;
            case "nim":
                result = validateNIM(value);
                break;
            case "email":
                result = validateEmail(value);
                break;
            case "departemen":
                result = validateDepartemen(value);
                break;
            case "programStudi":
                result = validateProgramStudi(value);
                break;
            case "tempatLahir":
                result = validateTempatLahir(value);
                break;
            case "tanggalLahir":
                result = validateTanggalLahir(value);
                break;
            case "noHp":
                result = validateNoHp(value);
                break;
            case "ipk":
                result = validateIPK(value);
                break;
            case "ips":
                result = validateIPS(value);
                break;
            default:
                return;
        }

        setErrors((prev) => ({
            ...prev,
            [field]: result.valid ? "" : result.errors[0] || "",
        }));
    };

    const validateAllFields = () => {
        const fields = [
            "namaLengkap",
            "role",
            "nim",
            "email",
            "departemen",
            "programStudi",
            "tempatLahir",
            "tanggalLahir",
            "noHp",
            "ipk",
            "ips",
        ];

        const newErrors: Record<string, string> = {};
        let allValid = true;

        fields.forEach((field) => {
            const value = data[field as keyof FormDataType];
            let result;

            switch (field) {
                case "namaLengkap":
                    result = validateNamaLengkap(value);
                    break;
                case "role":
                    result = validateRole(value);
                    break;
                case "nim":
                    result = validateNIM(value);
                    break;
                case "email":
                    result = validateEmail(value);
                    break;
                case "departemen":
                    result = validateDepartemen(value);
                    break;
                case "programStudi":
                    result = validateProgramStudi(value);
                    break;
                case "tempatLahir":
                    result = validateTempatLahir(value);
                    break;
                case "tanggalLahir":
                    result = validateTanggalLahir(value);
                    break;
                case "noHp":
                    result = validateNoHp(value);
                    break;
                case "ipk":
                    result = validateIPK(value);
                    break;
                case "ips":
                    result = validateIPS(value);
                    break;
                default:
                    return;
            }

            if (!result.valid) {
                newErrors[field] = result.errors[0] || "";
                allValid = false;
            }
        });

        setErrors(newErrors);
        return allValid;
    };

    React.useEffect(() => {
        (window as any).__validateInfoPengajuan = validateAllFields;
        return () => {
            delete (window as any).__validateInfoPengajuan;
        };
    }, [data]);

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
                            error={errors.namaLengkap}
                            onChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    namaLengkap: val,
                                }));
                                if (errors.namaLengkap) {
                                    handleValidation("namaLengkap", val);
                                }
                            }}
                            onBlur={() => handleValidation("namaLengkap", data.namaLengkap)}
                        />
                        <FormField
                            name="role"
                            label="Role"
                            value={data.role as string}
                            placeholder="Contoh: Mahasiswa"
                            error={errors.role}
                            onChange={(val) => {
                                setData((prev) => ({ ...prev, role: val }));
                                if (errors.role) {
                                    handleValidation("role", val);
                                }
                            }}
                            onBlur={() => handleValidation("role", data.role)}
                        />

                        <FormField
                            name="nim"
                            label="NIM"
                            value={data.nim as string}
                            placeholder="Contoh: 24060121130089"
                            error={errors.nim}
                            onChange={(val) => {
                                setData((prev) => ({ ...prev, nim: val }));
                                if (errors.nim) {
                                    handleValidation("nim", val);
                                }
                            }}
                            onBlur={() => handleValidation("nim", data.nim)}
                        />
                        <FormField
                            name="email"
                            label="Email"
                            value={data.email as string}
                            placeholder="Contoh: ahmadsyaifullah@students.undip.ac.id"
                            error={errors.email}
                            onChange={(val) => {
                                setData((prev) => ({ ...prev, email: val }));
                                if (errors.email) {
                                    handleValidation("email", val);
                                }
                            }}
                            onBlur={() => handleValidation("email", data.email)}
                        />

                        <FormField
                            name="departemen"
                            label="Departemen"
                            value={data.departemen as string}
                            placeholder="Contoh: Informatika"
                            error={errors.departemen}
                            onChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    departemen: val,
                                }));
                                if (errors.departemen) {
                                    handleValidation("departemen", val);
                                }
                            }}
                            onBlur={() => handleValidation("departemen", data.departemen)}
                        />
                        <FormField
                            name="programStudi"
                            label="Program Studi"
                            value={data.programStudi as string}
                            placeholder="Contoh: S1 - Informatika"
                            error={errors.programStudi}
                            onChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    programStudi: val,
                                }));
                                if (errors.programStudi) {
                                    handleValidation("programStudi", val);
                                }
                            }}
                            onBlur={() => handleValidation("programStudi", data.programStudi)}
                        />

                        <FormField
                            name="tempatLahir"
                            label="Tempat Lahir"
                            value={data.tempatLahir as string}
                            placeholder="Contoh: Blora"
                            error={errors.tempatLahir}
                            onChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    tempatLahir: val,
                                }));
                                if (errors.tempatLahir) {
                                    handleValidation("tempatLahir", val);
                                }
                            }}
                            onBlur={() => handleValidation("tempatLahir", data.tempatLahir)}
                        />
                        
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                Tanggal Lahir
                            </Label>
                            <DatePicker
                                date={
                                    data.tanggalLahir
                                        ? new Date(data.tanggalLahir as string)
                                        : undefined
                                }
                                onDateChange={(date) => {
                                    setData((prev) => ({
                                        ...prev,
                                        tanggalLahir: date?.toISOString() || "",
                                    }));
                                    if (errors.tanggalLahir) {
                                        handleValidation("tanggalLahir", date?.toISOString() || "");
                                    }
                                }}
                                placeholder="Pilih tanggal lahir"
                            />
                            {errors.tanggalLahir && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.tanggalLahir}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                No. HP
                            </Label>
                            <Input
                                name="noHp"
                                type="text"
                                inputMode="numeric"
                                value={data.noHp as string}
                                placeholder="Contoh: 081234567890"
                                onKeyDown={(e) => {
                                    if (
                                        e.key !== "Backspace" &&
                                        e.key !== "Delete" &&
                                        e.key !== "ArrowLeft" &&
                                        e.key !== "ArrowRight" &&
                                        e.key !== "Tab" &&
                                        !/^\d$/.test(e.key)
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d+$/.test(val)) {
                                        setData((prev) => ({ ...prev, noHp: val }));
                                        if (errors.noHp) {
                                            handleValidation("noHp", val);
                                        }
                                    }
                                }}
                                onBlur={() => handleValidation("noHp", data.noHp)}
                                className={`h-11 ${
                                    errors.noHp
                                        ? "bg-white border-red-500 focus-visible:ring-red-500"
                                        : "bg-white border-gray-300"
                                }`}
                            />
                            {errors.noHp && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.noHp}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                IPK
                            </Label>
                            <Input
                                name="ipk"
                                type="text"
                                inputMode="decimal"
                                value={data.ipk as string}
                                placeholder="Contoh: 3.75"
                                onKeyDown={(e) => {
                                    if (
                                        e.key !== "Backspace" &&
                                        e.key !== "Delete" &&
                                        e.key !== "ArrowLeft" &&
                                        e.key !== "ArrowRight" &&
                                        e.key !== "Tab" &&
                                        e.key !== "." &&
                                        !/^\d$/.test(e.key)
                                    ) {
                                        e.preventDefault();
                                    }
                                    if (e.key === "." && (e.target as HTMLInputElement).value.includes(".")) {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || (/^\d*\.?\d*$/.test(val) && (val === "" || parseFloat(val) <= 4))) {
                                        setData((prev) => ({ ...prev, ipk: val }));
                                        if (errors.ipk) {
                                            handleValidation("ipk", val);
                                        }
                                    }
                                }}
                                onBlur={() => handleValidation("ipk", data.ipk)}
                                className={`h-11 ${
                                    errors.ipk
                                        ? "bg-white border-red-500 focus-visible:ring-red-500"
                                        : "bg-white border-gray-300"
                                }`}
                            />
                            {errors.ipk && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.ipk}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                                IPS
                            </Label>
                            <Input
                                name="ips"
                                type="text"
                                inputMode="decimal"
                                value={data.ips as string}
                                placeholder="Contoh: 3.80"
                                onKeyDown={(e) => {
                                    if (
                                        e.key !== "Backspace" &&
                                        e.key !== "Delete" &&
                                        e.key !== "ArrowLeft" &&
                                        e.key !== "ArrowRight" &&
                                        e.key !== "Tab" &&
                                        e.key !== "." &&
                                        !/^\d$/.test(e.key)
                                    ) {
                                        e.preventDefault();
                                    }
                                    if (e.key === "." && (e.target as HTMLInputElement).value.includes(".")) {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || (/^\d*\.?\d*$/.test(val) && (val === "" || parseFloat(val) <= 4))) {
                                        setData((prev) => ({ ...prev, ips: val }));
                                        if (errors.ips) {
                                            handleValidation("ips", val);
                                        }
                                    }
                                }}
                                onBlur={() => handleValidation("ips", data.ips)}
                                className={`h-11 ${
                                    errors.ips
                                        ? "bg-white border-red-500 focus-visible:ring-red-500"
                                        : "bg-white border-gray-300"
                                }`}
                            />
                            {errors.ips && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {errors.ips}
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