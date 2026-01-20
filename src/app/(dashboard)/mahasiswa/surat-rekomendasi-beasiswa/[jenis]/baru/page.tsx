"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
    getApplicationById,
    type ApplicationAttachment,
} from "@/lib/application-api";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Stepper } from "@/components/features/surat-rekomendasi-beasiswa/form/Stepper";
import { InfoPengajuan } from "@/components/features/surat-rekomendasi-beasiswa/form/InfoPengajuan";
import { DetailPengajuan } from "@/components/features/surat-rekomendasi-beasiswa/form/DetailPengajuan";
import { Lampiran } from "@/components/features/surat-rekomendasi-beasiswa/form/Lampiran";
import { Review } from "@/components/features/surat-rekomendasi-beasiswa/form/Review";
import { FormAction } from "@/components/features/surat-rekomendasi-beasiswa/form/FormAction";
import type { FormDataType } from "@/types/form";

export default function PengajuanBaruPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const jenis = params.jenis as string;
    const editId = searchParams.get("id");

    const [currentStep, setCurrentStep] = useState<number>(1);

    const initialFormData: FormDataType = {
        // Step 1: Identitas
        namaLengkap: "",
        role: "MAHASISWA",
        nim: "",
        email: "",
        departemen: "",
        programStudi: "",
        tempatLahir: "",
        tanggalLahir: "",
        noHp: "",
        ipk: "",
        ips: "",
        semester: "",

        // Step 2: Detail
        namaBeasiswa: "",

        // Step 3: Lampiran
        lampiranUtama: [],
        lampiranTambahan: [],
    };

    const [formData, setFormData] = useState<FormDataType>(initialFormData);

    // ... existing localStorage logic

    // Fetch Data (Profile OR Existing Application)
    useEffect(() => {
        const loadInitialData = async () => {
            if (editId) {
                // Edit Mode: Fetch existing application
                try {
                    const app = await getApplicationById(editId);
                    if (app) {
                        setFormData((prev) => ({
                            ...prev,
                            // Spread existing formData from DB
                            ...app.formData,
                            // Ensure strictly required fields
                            namaBeasiswa:
                                app.scholarshipName ||
                                app.formData.namaBeasiswa ||
                                "",
                            letterInstanceId: app.id,
                            role: "MAHASISWA",
                            // Map attachments if needed
                            lampiranUtama: app.attachments
                                .filter(
                                    (a: ApplicationAttachment) =>
                                        a.category === "Utama",
                                )
                                .map((a: ApplicationAttachment) => ({
                                    file: undefined, // Changed from null as File | undefined is expected
                                    preview: "",
                                    name: a.filename,
                                    size: a.fileSize, // Added required size property
                                    type: a.attachmentType,
                                    existingId: a.id,
                                    downloadUrl: a.downloadUrl,
                                })),
                            lampiranTambahan: app.attachments
                                .filter(
                                    (a: ApplicationAttachment) =>
                                        a.category === "Tambahan",
                                )
                                .map((a: ApplicationAttachment) => ({
                                    file: undefined,
                                    preview: "",
                                    name: a.filename,
                                    size: a.fileSize, // Added required size property
                                    type: a.attachmentType,
                                    existingId: a.id,
                                    downloadUrl: a.downloadUrl,
                                })),
                        }));
                        // Maybe move to last step or keep at 1?
                        // Let's keep at 1 to review
                    }
                } catch (err) {
                    console.error("Failed to fetch application for edit:", err);
                }
            } else {
                // New Mode: Fetch Profile
                try {
                    const res = await fetch("/api/me", {
                        credentials: "include",
                    });
                    if (res.ok) {
                        const user = await res.json();
                        setFormData((prev) => ({
                            ...prev,
                            namaLengkap: user.name || prev.namaLengkap,
                            email: user.email || prev.email,
                            nim: user.mahasiswa?.nim || prev.nim,
                            departemen:
                                user.mahasiswa?.departemen?.name ||
                                prev.departemen,
                            programStudi:
                                user.mahasiswa?.programStudi?.name ||
                                prev.programStudi,
                            role: "MAHASISWA",
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                }
            }
        };
        loadInitialData();
    }, [editId]);

    // Define interface for window validation functions
    interface ValidationWindow extends Window {
        __validateInfoPengajuan?: () => boolean;
        __validateDetailPengajuan?: () => boolean;
    }

    const handleNext = () => {
        if (currentStep === 1) {
            const validateFn = (window as unknown as ValidationWindow)
                .__validateInfoPengajuan;
            if (validateFn && typeof validateFn === "function") {
                const isValid = validateFn();
                if (!isValid) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }
            }
        }

        if (currentStep === 2) {
            const validateFn = (window as unknown as ValidationWindow)
                .__validateDetailPengajuan;
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
                "semester",
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
                <Link href="/mahasiswa">
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
                formData={formData}
                jenis={jenis}
            />
        </div>
    );
}
