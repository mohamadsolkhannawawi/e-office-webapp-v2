"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

    const handleConfirmAjukan = () => {
        // Logic untuk ajukan surat (API call, dll)
        console.log("Surat diajukan!");
        // Redirect ke halaman detail surat
        router.push("/detail");
    };

    const handleAjukanSurat = () => {
        if (currentStep === 4) {
            // Di step terakhir, tidak langsung redirect tapi buka dialog konfirmasi
            // Dialog akan handle via AlertDialogTrigger
            return;
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
                {currentStep === 4 ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="bg-[#007bff] hover:bg-blue-700 text-white h-11 px-8 font-medium shadow-sm shadow-blue-200"
                                disabled={
                                    !!(
                                        typeof isNextDisabled !== "undefined" &&
                                        isNextDisabled
                                    )
                                }
                            >
                                Ajukan Surat
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Pengajuan Surat</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin mengajukan surat ini? 
                                    Setelah diajukan, surat akan masuk ke proses verifikasi 
                                    dan tidak dapat diubah.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleConfirmAjukan}
                                    className="bg-[#007bff] hover:bg-blue-700"
                                >
                                    Ya, Ajukan
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
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
                        Lanjut
                    </Button>
                )}
            </div>
        </div>
    );
}
