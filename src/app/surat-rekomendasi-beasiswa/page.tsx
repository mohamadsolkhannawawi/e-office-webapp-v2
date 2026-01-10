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

export default function SuratRekomendasiPage() {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return <InfoPengajuan />;
            case 2:
                return <DetailPengajuan />;
            case 3:
                return <Lampiran />;
            case 4:
                return <Review />;
            default:
                return <InfoPengajuan />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-20">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-8">
                <Stepper currentStep={currentStep} />

                <div className="min-h-[500px] animate-in fade-in zoom-in duration-300">
                    {renderContent()}
                </div>

                <FormAction
                    currentStep={currentStep}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            </main>
        </div>
    );
}
