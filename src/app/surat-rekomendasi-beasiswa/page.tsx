"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
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

    const isStepValid = () => {
        if (currentStep === 1) {
            return true; 
        }
        if (currentStep === 2) {
            return !!formData.namaBeasiswa;
        }
        if (currentStep === 3) {
            return true;
        }
        return true;
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return <InfoPengajuan data={formData} setData={setFormData} />;
            case 2:
                return <DetailPengajuan data={formData} setData={setFormData} />;
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
                            <h2 className="text-2xl font-bold text-gray-900">Identitas Pemohon</h2>
                            <p className="text-gray-500 mt-1">
                                Data berikut diisi secara otomatis berdasarkan data Anda. Mohon periksa kembali.
                            </p>
                        </>
                    )}
                    {currentStep === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pengajuan</h2>
                            <p className="text-gray-500 mt-1">
                                Lengkapi detail informasi surat rekomendasi yang Anda ajukan.
                            </p>
                        </>
                    )}
                    {currentStep === 3 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">Lampiran Dokumen</h2>
                            <p className="text-gray-500 mt-1">
                                Unggah dokumen pendukung yang diperlukan untuk pengajuan ini.
                            </p>
                        </>
                    )}
                    {currentStep === 4 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900">Review & Ajukan</h2>
                            <p className="text-gray-500 mt-1">
                                Periksa kembali seluruh data sebelum melakukan pengajuan surat.
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
                />
            </main>
        </div>
    );
}