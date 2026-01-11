"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ActionProps {
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    isNextDisabled?: boolean;
}

export function FormAction({
    currentStep,
    onNext,
    onBack,
    isNextDisabled,
}: ActionProps) {
    const router = useRouter();

    const handleAjukanSurat = () => {
        if (currentStep === 4) {
            // Redirect ke halaman detail surat
            router.push("/detail");
        } else {
            onNext();
        }
    };

    return (
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            {/* Tombol KEMBALI (Hilang kalau di step 1) */}
            <Button
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 1}
                className={`bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6 h-11 ${
                    currentStep === 1 ? "opacity-0 pointer-events-none" : ""
                }`}
            >
                Kembali
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    className="text-[#007bff] border-[#007bff]/50 hover:bg-blue-50 h-11 px-6"
                >
                    Simpan Draft
                </Button>
                {/* Tombol LANJUT / AJUKAN */}
                <Button
                    onClick={handleAjukanSurat}
                    className="bg-[#007bff] hover:bg-blue-700 text-white h-11 px-8 font-medium shadow-sm shadow-blue-200"
                    disabled={
                        !!(
                            typeof isNextDisabled !== "undefined" &&
                            isNextDisabled
                        )
                    }
                >
                    {currentStep === 4 ? "Ajukan Surat" : "Lanjut"}
                </Button>
            </div>
        </div>
    );
}
