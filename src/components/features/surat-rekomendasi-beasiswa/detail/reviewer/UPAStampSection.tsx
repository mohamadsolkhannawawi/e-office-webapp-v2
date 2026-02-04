"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Trash2,
    Upload,
    Check,
    Star,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { SignatureImage } from "@/components/ui/signature-image";
import toast from "react-hot-toast";
import {
    getStamps,
    saveStamp,
    setDefaultStamp,
    deleteStamp,
    applyStampToLetter,
    UserStamp,
} from "@/lib/application-api";

interface UPAStampSectionProps {
    applicationId: string;
    onStampChange: (
        data: { stampId: string; stampUrl: string | null } | null,
    ) => void;
    appliedStampId?: string | null;
}

export function UPAStampSection({
    applicationId,
    onStampChange,
    appliedStampId,
}: UPAStampSectionProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        null,
    );
    const [templates, setTemplates] = useState<UserStamp[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Fetch saved stamp templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            const data = await getStamps();
            setTemplates(data);

            // Pre-select applied stamp if it exists
            if (appliedStampId) {
                const appliedStamp = data.find((t) => t.id === appliedStampId);
                if (appliedStamp) {
                    setSelectedTemplateId(appliedStamp.id);
                    setPreviewImage(appliedStamp.url);
                }
            } else {
                // Pre-select default stamp if no applied stamp
                const defaultStamp = data.find((t) => t.isDefault);
                if (defaultStamp) {
                    setSelectedTemplateId(defaultStamp.id);
                    setPreviewImage(defaultStamp.url);
                }
            }

            setHasInitialized(true);
            setIsLoading(false);
        };
        fetchTemplates();
    }, [appliedStampId]);

    const selectTemplate = async (id: string, url: string) => {
        setSelectedTemplateId(id);
        setPreviewImage(url);
    };

    const handleSaveSelection = async () => {
        if (!selectedTemplateId) {
            toast.error("Pilih stempel terlebih dahulu");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Menerapkan stempel...");

        try {
            const selectedTemplate = templates.find(
                (t) => t.id === selectedTemplateId,
            );

            const success = await applyStampToLetter(
                applicationId,
                selectedTemplateId,
            );
            if (success) {
                // Pass both stampId and stampUrl to parent
                onStampChange({
                    stampId: selectedTemplateId,
                    stampUrl: selectedTemplate?.url || null,
                });
                toast.success("Stempel berhasil diterapkan", { id: toastId });
            } else {
                toast.error("Gagal menerapkan stempel", { id: toastId });
            }
        } catch (error) {
            console.error("Save selection error:", error);
            toast.error("Terjadi kesalahan", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const success = await setDefaultStamp(id);
            if (success) {
                setTemplates((prev) =>
                    prev.map((t) => ({ ...t, isDefault: t.id === id })),
                );
                toast.success("Template dijadikan default");
            } else {
                toast.error("Gagal mengatur template default");
            }
        } catch (error) {
            console.error("Set default error:", error);
            toast.error("Terjadi kesalahan saat mengatur default");
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        try {
            const success = await deleteStamp(id);
            if (success) {
                setTemplates((prev) => prev.filter((t) => t.id !== id));
                toast.success("Template berhasil dihapus");

                // Clear selection if deleted template was selected
                if (selectedTemplateId === id) {
                    setSelectedTemplateId(null);
                    setPreviewImage(null);
                    onStampChange(null);
                }
            } else {
                toast.error("Gagal menghapus template");
            }
        } catch (error) {
            console.error("Delete template error:", error);
            toast.error("Terjadi kesalahan saat menghapus template");
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-undip-blue" />
                    Stamp Template
                </h2>
            </div>

            <Card className="border border-slate-200 shadow-sm rounded-3xl">
                <CardContent className="p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className={`relative aspect-video rounded-xl border-2 transition-all cursor-pointer group flex items-center justify-center p-4 bg-white ${
                                        selectedTemplateId === template.id
                                            ? "border-undip-blue shadow-md shadow-blue-50 ring-2 ring-blue-50"
                                            : "border-slate-100 hover:border-slate-300"
                                    }`}
                                    onClick={() =>
                                        selectTemplate(
                                            template.id,
                                            template.url,
                                        )
                                    }
                                >
                                    <SignatureImage
                                        src={template.url}
                                        alt="Stamp Template"
                                        className="object-contain mix-blend-multiply w-24 h-12"
                                    />
                                    {template.isDefault && (
                                        <div
                                            className="absolute top-2 left-2 bg-amber-500 text-white rounded-full p-1 shadow-sm"
                                            title="Default stamp"
                                        >
                                            <Star className="h-3 w-3" />
                                        </div>
                                    )}
                                    {appliedStampId === template.id && (
                                        <div
                                            className="absolute bottom-2 left-2 bg-green-500 text-white rounded-full p-1 shadow-sm"
                                            title="Applied to document"
                                        >
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                    {selectedTemplateId === template.id &&
                                        appliedStampId !== template.id && (
                                            <div
                                                className="absolute top-2 right-2 bg-undip-blue text-white rounded-full p-1 shadow-sm animate-in zoom-in"
                                                title="Selected for save"
                                            >
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        {!template.isDefault && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetDefault(
                                                        template.id,
                                                    );
                                                }}
                                                className="p-1 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                                                title="Set as default"
                                            >
                                                <Star className="h-3 w-3" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTemplate(
                                                    template.id,
                                                );
                                            }}
                                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div
                                className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-undip-blue hover:text-undip-blue transition-all cursor-pointer"
                                onClick={() =>
                                    document
                                        .getElementById("template-upload")
                                        ?.click()
                                }
                            >
                                <input
                                    id="template-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = async () => {
                                                const url =
                                                    reader.result as string;
                                                setIsSaving(true);
                                                const toastId = toast.loading(
                                                    "Mengunggah template...",
                                                );

                                                try {
                                                    const result =
                                                        await saveStamp({
                                                            url,
                                                            stampType:
                                                                "TEMPLATE",
                                                        });
                                                    if (
                                                        result.success &&
                                                        result.data
                                                    ) {
                                                        setTemplates((prev) => [
                                                            result.data!,
                                                            ...prev,
                                                        ]);
                                                        toast.success(
                                                            "Template berhasil diunggah",
                                                            {
                                                                id: toastId,
                                                            },
                                                        );
                                                    } else {
                                                        toast.error(
                                                            result.error ||
                                                                "Gagal mengunggah template",
                                                            {
                                                                id: toastId,
                                                            },
                                                        );
                                                    }
                                                } catch (error) {
                                                    const errorMessage =
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Terjadi kesalahan";
                                                    console.error(
                                                        "Template upload error:",
                                                        error,
                                                    );
                                                    toast.error(errorMessage, {
                                                        id: toastId,
                                                    });
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {isSaving ? (
                                    <Loader2 className="h-5 w-5 mb-2 animate-spin" />
                                ) : (
                                    <Upload className="h-5 w-5 mb-2" />
                                )}
                                <p className="text-[10px] font-bold uppercase">
                                    Tambah Baru
                                </p>
                            </div>
                            {templates.length === 0 && !isLoading && (
                                <div className="col-span-2 text-center py-8 text-slate-400">
                                    <p className="text-sm">
                                        Belum ada template tersimpan
                                    </p>
                                    <p className="text-xs mt-1">
                                        Upload template baru untuk memulai
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="bg-white p-2.5 rounded-xl shadow-sm text-undip-blue">
                    <Check className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">
                        Verifikasi Stempel Digital
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Stempel yang Anda bubuhkan di sini akan otomatis
                        disematkan pada dokumen Surat Rekomendasi Beasiswa di
                        tahapan final publikasi. Pastikan stempel terlihat
                        jelas.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleSaveSelection}
                disabled={!selectedTemplateId || isSaving}
                className="w-full bg-undip-blue hover:bg-undip-blue/90 text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 text-base shadow-sm transition-all disabled:opacity-50"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menerapkan...
                    </>
                ) : (
                    <>
                        <Check className="h-5 w-5" />
                        Simpan Stempel
                    </>
                )}
            </Button>
        </div>
    );
}
