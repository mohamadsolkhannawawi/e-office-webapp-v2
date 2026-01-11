"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Stepper } from "@/components/features/surat-rekomendasi/Stepper";
import { InfoPengajuan } from "@/components/features/surat-rekomendasi/InfoPengajuan";
import { DetailPengajuan } from "@/components/features/surat-rekomendasi/DetailPengajuan";
import { Lampiran } from "@/components/features/surat-rekomendasi/Lampiran";
import { Review } from "@/components/features/surat-rekomendasi/Review";
import { FormAction } from "@/components/features/surat-rekomendasi/FormAction";
import type { FormDataType } from "@/types/form";

export default function SuratRekomendasiPage() {
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

    // load persisted data on mount
    useEffect(() => {
        const raw = localStorage.getItem("suratRekomendasiForm");
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
    }, []);

    useEffect(() => {
        try {
            const payload = { formData, currentStep };
            localStorage.setItem(
                "suratRekomendasiForm",
                JSON.stringify(payload)
            );
        } catch (err) {
            console.warn("Failed to persist form data", err);
        }
    }, [formData, currentStep]);

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

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-20">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-8">
                    {currentStep === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Identitas Pemohon
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Data berikut diisi secara otomatis berdasarkan
                                data Anda. Mohon periksa kembali.
                            </p>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Detail Pengajuan
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Lengkapi detail informasi surat rekomendasi yang
                                Anda ajukan.
                            </p>
                        </>
                    )}
                    {currentStep === 3 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Lampiran Dokumen
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Unggah dokumen pendukung yang diperlukan untuk
                                pengajuan ini.
                            </p>
                        </>
                    )}
                    {currentStep === 4 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Review & Ajukan
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Periksa kembali seluruh data sebelum melakukan
                                pengajuan surat.
                            </p>
                        </>
                    )}
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
            </main>
        </div>
    );
}