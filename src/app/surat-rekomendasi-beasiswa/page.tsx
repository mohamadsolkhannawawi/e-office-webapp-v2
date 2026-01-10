"use client";

import { useState } from "react";

// 1. Import Layout Global
import { Navbar } from "@/components/layout/Navbar";

// 2. Import Komponen Fitur (Wizard)
import { Stepper } from "@/components/features/surat-rekomendasi/Stepper";
import { InfoPengajuan } from "@/components/features/surat-rekomendasi/InfoPengajuan";
import { DetailPengajuan } from "@/components/features/surat-rekomendasi/DetailPengajuan";
import { Lampiran } from "@/components/features/surat-rekomendasi/Lampiran";
import { Review } from "@/components/features/surat-rekomendasi/Review";
import { FormAction } from "@/components/features/surat-rekomendasi/FormAction";
import type { FormDataType } from "@/types/form";

export default function SuratRekomendasiPage() {
    const [currentStep, setCurrentStep] = useState(1);
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

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    // Validasi sederhana: cek semua field step terisi
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
            ].every((key) => formData[key]);
        }
        if (currentStep === 2) {
            return !!formData.namaBeasiswa;
        }
        if (currentStep === 3) {
            return formData.lampiranUtama && formData.lampiranUtama.length > 0;
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
                <Stepper currentStep={currentStep} />

                <div className="min-h-125 animate-in fade-in zoom-in duration-300">
                    {renderContent()}
                </div>

                <FormAction
                    currentStep={currentStep}
                    onNext={handleNext}
                    onBack={handleBack}
                    isNextDisabled={!isStepValid()}
                />
            </main>
        </div>
    );
}
