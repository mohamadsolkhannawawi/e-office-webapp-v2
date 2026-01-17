"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Stepper } from "@/components/features/surat-rekomendasi/Stepper";
import { InfoPengajuan } from "@/components/features/surat-rekomendasi/InfoPengajuan";
import { DetailPengajuan } from "@/components/features/surat-rekomendasi/DetailPengajuan";
import { Lampiran } from "@/components/features/surat-rekomendasi/Lampiran";
import { Review } from "@/components/features/surat-rekomendasi/Review";
import { FormAction } from "@/components/features/surat-rekomendasi/FormAction";
import type { FormDataType } from "@/types/form";

export default function PengajuanBaruPage() {
    const params = useParams();
    const router = useRouter();
    const jenis = params.jenis as string;

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormDataType>({
        namaLengkap: "",
        role: "",
        nim: "",
        email: "",
        departemen: "",
        programStudi: "",
        tempatLahir: "",
        tanggalLahir: "",
        noHp: "",
        ipk: "",
        ips: "",
        namaBeasiswa: "",
        lampiranUtama: [],
        lampiranTambahan: [],
    });

    // Storage key unik per jenis beasiswa
    const storageKey = `suratRekomendasiForm_${jenis}`;

    // Load persisted data on mount
    useEffect(() => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;

        const timer = setTimeout(() => {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object") {
                    if (parsed.formData) {
                        setFormData((prev) => ({
                            ...prev,
                            ...parsed.formData,
                        }));
                    }
                    if (parsed.currentStep) {
                        setCurrentStep(Number(parsed.currentStep) || 1);
                    }
                }
            } catch (err) {
                console.warn("Failed to load persisted form data", err);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [storageKey]);

    useEffect(() => {
        try {
            const payload = { formData, currentStep };
            localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch (err) {
            console.warn("Failed to persist form data", err);
        }
    }, [formData, currentStep, storageKey]);

    const handleNext = () => {
        if (currentStep === 1) {
            const validateFn = (window as any).__validateInfoPengajuan;
            if (validateFn && typeof validateFn === "function") {
                const isValid = validateFn();
                if (!isValid) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }
            }
        }

        if (currentStep === 2) {
            const validateFn = (window as any).__validateDetailPengajuan;
            if (validateFn && typeof validateFn === "function") {
                const isValid = validateFn();
                if (!isValid) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }
            }
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const isStepValid = () => {
        if (currentStep === 1) {
            return [
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
            ].every((k) => {
                const v = formData[k as keyof FormDataType];
                return v !== undefined && v !== null && String(v).trim() !== "";
            });
        }
        if (currentStep === 2) {
            return (
                !!formData.namaBeasiswa &&
                String(formData.namaBeasiswa).trim() !== ""
            );
        }
        if (currentStep === 3) {
            return (
                Array.isArray(formData.lampiranUtama) &&
                formData.lampiranUtama.length > 0
            );
        }
        return true;
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return {
                    title: "Identitas Pemohon",
                    desc: "Data berikut diisi secara otomatis berdasarkan data Anda. Mohon periksa kembali.",
                };
            case 2:
                return {
                    title: "Detail Pengajuan",
                    desc: "Lengkapi detail informasi surat rekomendasi yang Anda ajukan.",
                };
            case 3:
                return {
                    title: "Lampiran Dokumen",
                    desc: "Unggah dokumen pendukung yang diperlukan untuk pengajuan ini.",
                };
            case 4:
                return {
                    title: "Review & Ajukan",
                    desc: "Periksa kembali seluruh data sebelum melakukan pengajuan surat.",
                };
            default:
                return { title: "", desc: "" };
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return <InfoPengajuan data={formData} setData={setFormData} />;
            case 2:
                return (
                    <DetailPengajuan data={formData} setData={setFormData} />
                );
            case 3:
                return <Lampiran data={formData} setData={setFormData} />;
            case 4:
                return <Review data={formData} />;
            default:
                return <InfoPengajuan data={formData} setData={setFormData} />;
        }
    };

    const stepInfo = getStepTitle();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {stepInfo.title}
                    </h1>
                    <p className="text-gray-500 mt-1">{stepInfo.desc}</p>
                </div>
            </div>

            <Stepper currentStep={currentStep} />

            <div className="min-h-125 animate-in fade-in zoom-in duration-300">
                {renderContent()}
            </div>

            <FormAction
                currentStep={currentStep}
                onNext={handleNext}
                onBack={handleBack}
                isNextDisabled={!isStepValid()}
                letterInstanceId={formData.letterInstanceId}
            />
        </div>
    );
}
