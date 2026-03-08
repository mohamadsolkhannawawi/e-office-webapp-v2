"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getApplicationByIdOrCreate } from "@/lib/application-api";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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
    const router = useRouter();
    const jenis = params.jenis as string;
    const editId = searchParams.get("id");
    const mode = (searchParams.get("mode") || "default") as
        | "default"
        | "student_edit";

    const [currentStep, setCurrentStep] = useState<number>(1);
    const { user: authUser, isLoading: isAuthLoading } = useAuth();

    const [formData, setFormData] = useState<FormDataType>(() => {
        // Lazy initializer: restore from localStorage on first mount (new mode only)
        const base: FormDataType = {
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
            namaBeasiswa: "",
            lampiranUtama: [],
            lampiranTambahan: [],
        };
        if (!editId && typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(`srb_form_${jenis}`);
                if (saved) return { ...base, ...JSON.parse(saved) };
            } catch {
                // ignore parse errors
            }
        }
        return base;
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Consolidated Initialization Logic for Async Data
    useEffect(() => {
        // Rest of initialization
        const fetchAsyncData = async () => {
            // 1. Fetch specific data based on mode
            if (editId) {
                // Edit Mode: Fetch existing application or create new draft if not found
                try {
                    const data = await getApplicationByIdOrCreate(editId);

                    // If new draft was created, update URL with new ID
                    if (data.isNewDraft) {
                        console.log(
                            "📝 [PengajuanBaruPage] New draft created, updating URL with new ID:",
                            data.id,
                        );
                        router.replace(
                            `/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${data.id}`,
                        );
                    }

                    if (data) {
                        setFormData((prev) => ({
                            ...prev,
                            ...data.formData,
                            letterInstanceId: data.id,
                            lampiranUtama: data.attachments
                                .filter((a) => a.category === "Utama")
                                .map((a) => ({
                                    id: a.id,
                                    name: a.filename,
                                    size: a.fileSize,
                                    attachmentType: a.attachmentType,
                                    downloadUrl: a.downloadUrl,
                                })),
                            lampiranTambahan: data.attachments
                                .filter((a) => a.category === "Tambahan")
                                .map((a) => ({
                                    id: a.id,
                                    name: a.filename,
                                    size: a.fileSize,
                                    attachmentType: a.attachmentType,
                                    downloadUrl: a.downloadUrl,
                                })),
                        }));
                    }
                } catch (err) {
                    console.error(
                        "Failed to fetch or create application for edit:",
                        err,
                    );
                }
            } else if (!isAuthLoading && authUser) {
                // New Mode: Fetch profile details to pre-fill if identity is missing
                try {
                    const res = await fetch("/api/me", {
                        credentials: "include",
                    });
                    if (res.ok) {
                        const user = await res.json();
                        setFormData((prev) => {
                            // Only update if current state is missing these basic fields
                            const updated = {
                                ...prev,
                                namaLengkap:
                                    prev.namaLengkap ||
                                    user.name ||
                                    authUser.name ||
                                    "",
                                email:
                                    prev.email ||
                                    user.email ||
                                    authUser.email ||
                                    "",
                                nim: prev.nim || user.mahasiswa?.nim || "",
                                departemen:
                                    prev.departemen ||
                                    user.mahasiswa?.departemen?.name ||
                                    "",
                                programStudi:
                                    prev.programStudi ||
                                    user.mahasiswa?.programStudi?.name ||
                                    "",
                                tempatLahir:
                                    prev.tempatLahir ||
                                    user.mahasiswa?.tempatLahir ||
                                    "",
                                tanggalLahir:
                                    prev.tanggalLahir ||
                                    (user.mahasiswa?.tanggalLahir
                                        ? new Date(user.mahasiswa.tanggalLahir)
                                              .toISOString()
                                              .split("T")[0]
                                        : ""),
                                role: "MAHASISWA" as const,
                            };
                            return updated;
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch profile details:", err);
                }
            }

            setIsDataLoaded(true);
        };

        if (!isAuthLoading) {
            fetchAsyncData();
        }
    }, [editId, authUser, isAuthLoading, jenis, router]);

    // Update URL if ID exists (handles draft -> edit transition)
    useEffect(() => {
        if (formData.letterInstanceId && !editId) {
            const newUrl = `${window.location.pathname}?id=${formData.letterInstanceId}`;
            window.history.replaceState(null, "", newUrl);
        }
    }, [formData.letterInstanceId, editId]);

    // Save to localStorage on change (only for "New" mode)
    useEffect(() => {
        if (!editId && isDataLoaded) {
            localStorage.setItem(`srb_form_${jenis}`, JSON.stringify(formData));
        }
    }, [formData, editId, jenis, isDataLoaded]);

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
                formData.lampiranUtama.length >= 2
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
                    <DetailPengajuan
                        data={formData}
                        setData={setFormData}
                        jenis={jenis}
                    />
                );
            case 3:
                return (
                    <Lampiran
                        data={formData}
                        setData={setFormData}
                        jenis={jenis}
                    />
                );
            case 4:
                return <Review data={formData} />;
            default:
                return <InfoPengajuan data={formData} setData={setFormData} />;
        }
    };

    const stepInfo = getStepTitle();

    const pageTitle =
        mode === "student_edit"
            ? "Edit Surat (Revisi Mandiri)"
            : stepInfo.title;
    const pageDesc =
        mode === "student_edit"
            ? "Edit data surat sebelum diproses oleh Supervisor Akademik. Perubahan akan dicatat dalam riwayat."
            : stepInfo.desc;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="order-2 sm:order-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {pageTitle}
                    </h1>
                    <p className="text-gray-500 mt-1">{pageDesc}</p>
                </div>
                <Link
                    href={
                        mode === "student_edit" && editId
                            ? `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${editId}?from=proses`
                            : "/mahasiswa/surat/surat-rekomendasi-beasiswa"
                    }
                    className="order-1 sm:order-2 self-start sm:self-auto"
                >
                    <Button className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-3xl inline-flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-semibold">Kembali</span>
                    </Button>
                </Link>
            </div>

            {/* Student Edit notice banner */}
            {mode === "student_edit" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="p-1.5 bg-amber-100 rounded-xl shrink-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-amber-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            Mode Revisi Mandiri
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Perubahan Anda akan dicatat sebagai{" "}
                            <strong>&ldquo;Revisi oleh Mahasiswa&rdquo;</strong>{" "}
                            dalam riwayat surat dan dapat dilihat oleh semua
                            pihak yang terlibat.
                        </p>
                    </div>
                </div>
            )}

            <Stepper currentStep={currentStep} />

            <div
                className={`${currentStep !== 2 ? "min-h-125" : ""} animate-in fade-in zoom-in duration-300`}
            >
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
                mode={mode}
            />
        </div>
    );
}
