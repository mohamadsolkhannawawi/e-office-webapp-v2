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

import {
    updateApplication,
    createDraftApplication,
} from "@/lib/attachment-api";
import { FormDataType } from "@/types/form";

interface ActionProps {
    currentStep: number;
    onNext: () => void;
    onBack: () => void;
    isNextDisabled?: boolean;
    letterInstanceId?: string;
    formData?: FormDataType;
    jenis?: string;
}

export function FormAction({
    currentStep,
    onNext,
    onBack,
    isNextDisabled,
    letterInstanceId,
    formData,
    jenis,
}: ActionProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSaveDraft = async () => {
        if (!formData) return;

        setIsSubmitting(true);
        try {
            if (letterInstanceId) {
                // Update existing
                await updateApplication(letterInstanceId, {
                    namaBeasiswa: formData.namaBeasiswa,
                    values: {
                        ...(formData as unknown as Record<string, unknown>),
                        jenisBeasiswa: jenis,
                    },
                    status: "DRAFT",
                });
                // alert("Draft berhasil diperbarui!");
            } else {
                // Create new
                const res = await createDraftApplication(
                    formData.namaBeasiswa,
                    {
                        ...(formData as unknown as Record<string, unknown>),
                        jenisBeasiswa: jenis,
                    },
                );

                // Update URL to include the new ID so the user stays on this draft
                const targetJenis = jenis || "internal";
                localStorage.removeItem(`srb_form_${jenis}`);
                router.replace(
                    `/mahasiswa/surat-rekomendasi-beasiswa/${targetJenis}?id=${res.id}`,
                );
            }
            // Optional: Toast notification here if available, or simple alert
            // alert("Draft tersimpan.");
        } catch (error) {
            console.error("Failed to save draft:", error);
            alert("Gagal menyimpan draft.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmAjukan = async () => {
        if (!letterInstanceId || !formData) {
            console.error("Missing letterInstanceId or formData");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateApplication(letterInstanceId, {
                namaBeasiswa: formData.namaBeasiswa,
                values: {
                    ...(formData as unknown as Record<string, unknown>),
                    jenisBeasiswa: jenis,
                },
                status: "PENDING",
            });

            localStorage.removeItem(`srb_form_${jenis}`); // Clear specific local storage

            const targetJenis = jenis || "internal";
            router.push(
                `/mahasiswa/surat-rekomendasi-beasiswa/${targetJenis}/${letterInstanceId}`,
            );
        } catch (error) {
            console.error("Failed to submit application:", error);
            alert("Gagal mengajukan surat. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAjukanSurat = () => {
        if (currentStep === 4) {
            return;
        } else {
            onNext();
        }
    };

    return (
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
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
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Menyimpan..." : "Simpan Draft"}
                </Button>
                {currentStep === 4 ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="bg-[#007bff] hover:bg-blue-700 text-white h-11 px-8 font-medium shadow-sm shadow-blue-200"
                                disabled={
                                    isSubmitting ||
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
                                <AlertDialogTitle>
                                    Konfirmasi Pengajuan Surat
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin mengajukan surat
                                    ini? Setelah diajukan, surat akan masuk ke
                                    proses verifikasi dan tidak dapat diubah.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmAjukan}
                                    className="bg-[#007bff] hover:bg-blue-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Mengajukan..."
                                        : "Ya, Ajukan"}
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
