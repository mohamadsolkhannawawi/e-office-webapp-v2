"use client";

import React, { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Camera,
    Layout,
    PenTool,
    Trash2,
    Upload,
    Check,
    Star,
    Loader2,
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { SignatureImage } from "@/components/ui/signature-image";
import toast from "react-hot-toast";
import {
    getSignatures,
    saveSignature,
    setDefaultSignature,
    deleteSignature,
    UserSignature,
} from "@/lib/application-api";

interface WD1SignatureSectionProps {
    onSignatureChange: (signature: string | null) => void;
    initialSignature?: string | null;
}

export function WD1SignatureSection({
    onSignatureChange,
    initialSignature,
}: WD1SignatureSectionProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [selectedMethod, setSelectedMethod] = useState("upload");
    const [previewImage, setPreviewImage] = useState<string | null>(
        initialSignature || null,
    );
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        null,
    );
    const [templates, setTemplates] = useState<UserSignature[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with initialSignature
    useEffect(() => {
        if (initialSignature) {
            setPreviewImage(initialSignature);
        }
    }, [initialSignature]);

    // Fetch saved signature templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            const data = await getSignatures();
            setTemplates(data);
            setIsLoading(false);
        };
        fetchTemplates();
    }, []);

    const clearCanvas = () => {
        sigCanvas.current?.clear();
        onSignatureChange(null);
    };

    const saveCanvas = () => {
        if (sigCanvas.current?.isEmpty()) return;
        const dataUrl = sigCanvas.current
            ?.getTrimmedCanvas()
            .toDataURL("image/png");
        if (dataUrl) {
            setPreviewImage(dataUrl);
            onSignatureChange(dataUrl);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error(
                    "Ukuran file terlalu besar! File maksimal 5MB. Silakan kompres gambar Anda",
                );
                return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error(
                    "File harus berupa gambar! Format yang didukung: JPG, PNG, GIF",
                );
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
                onSignatureChange(result);
            };
            reader.onerror = () => {
                toast.error(
                    "Gagal membaca file. Silakan coba file lain atau hubungi administrator",
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const selectTemplate = (id: string, url: string) => {
        setSelectedTemplateId(id);
        setPreviewImage(url);
        onSignatureChange(url);
    };

    const handleSetDefault = async (id: string) => {
        try {
            const success = await setDefaultSignature(id);
            if (success) {
                setTemplates((prev) =>
                    prev.map((t) => ({ ...t, isDefault: t.id === id })),
                );
                toast.success(
                    "Template berhasil dijadikan default! Template ini akan digunakan secara otomatis",
                );
            } else {
                toast.error(
                    "Gagal mengatur template default. Silakan coba lagi",
                );
            }
        } catch (error) {
            console.error("Set default error:", error);
            toast.error(
                "Terjadi kesalahan sistem saat mengatur default. Hubungi administrator",
            );
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        try {
            const success = await deleteSignature(id);
            if (success) {
                setTemplates((prev) => prev.filter((t) => t.id !== id));
                toast.success("Template berhasil dihapus dari sistem");

                // Clear selection if deleted template was selected
                if (selectedTemplateId === id) {
                    setSelectedTemplateId(null);
                    setPreviewImage(null);
                    onSignatureChange(null);
                }
            } else {
                toast.error("Gagal menghapus template. Silakan coba lagi");
            }
        } catch (error) {
            console.error("Delete template error:", error);
            toast.error(
                "Terjadi kesalahan sistem saat menghapus template. Hubungi administrator",
            );
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-undip-blue" />
                    Pemberian Tanda Tangan
                </h2>
                {previewImage && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                        <Check className="h-3 w-3" />
                        Tersimpan
                    </div>
                )}
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl">
                <CardContent className="p-0">
                    <Tabs
                        defaultValue="upload"
                        className="w-full"
                        onValueChange={setSelectedMethod}
                    >
                        <TabsList className="w-full h-auto bg-slate-50 p-1 rounded-none border-b border-slate-100 flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <TabsTrigger
                                value="upload"
                                className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-undip-blue data-[state=active]:shadow-none border-b sm:border-r border-slate-100 gap-2 font-bold text-sm"
                            >
                                <Camera className="h-4 w-4" />
                                Kamera/File
                            </TabsTrigger>
                            <TabsTrigger
                                value="template"
                                className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-undip-blue data-[state=active]:shadow-none border-b sm:border-r border-slate-100 gap-2 font-bold text-sm"
                            >
                                <Layout className="h-4 w-4" />
                                Template
                            </TabsTrigger>
                            <TabsTrigger
                                value="canvas"
                                className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-undip-blue data-[state=active]:shadow-none gap-2 font-bold text-sm"
                            >
                                <PenTool className="h-4 w-4" />
                                Manual Scribble
                            </TabsTrigger>
                        </TabsList>

                        <div className="p-8">
                            <TabsContent
                                value="upload"
                                className="mt-0 focus-visible:outline-none"
                            >
                                <div className="space-y-4">
                                    <div
                                        className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-undip-blue transition-all group cursor-pointer relative"
                                        onClick={() =>
                                            document
                                                .getElementById("sig-upload")
                                                ?.click()
                                        }
                                    >
                                        <input
                                            id="sig-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="h-8 w-8 text-undip-blue" />
                                        </div>
                                        <p className="font-bold text-slate-700">
                                            Unggah Foto Tanda Tangan
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2 text-center">
                                            Seret file ke sini atau klik untuk
                                            memilih file dari komputer Anda.
                                            <br />
                                            (Format .PNG dengan background
                                            transparan disarankan)
                                        </p>
                                    </div>

                                    {previewImage &&
                                        selectedMethod === "upload" && (
                                            <div className="bg-slate-50 rounded-3xl p-4 flex flex-col items-center border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                    Pratinjau Unggahan
                                                </p>
                                                <div className="relative w-48 h-24 bg-white rounded-3xl border border-slate-200 p-2 overflow-hidden shadow-sm">
                                                    <SignatureImage
                                                        src={previewImage}
                                                        alt="Uploaded Signature"
                                                        className="object-contain p-2 mix-blend-multiply w-full h-full"
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-3 text-red-500 hover:text-red-600 hover:bg-red-50 h-8 gap-1.5 font-bold"
                                                    onClick={() => {
                                                        setPreviewImage(null);
                                                        onSignatureChange(null);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        )}
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="template"
                                className="mt-0 focus-visible:outline-none"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {templates.map((template) => (
                                            <div
                                                key={template.id}
                                                className={`relative aspect-video rounded-3xl border-2 transition-all cursor-pointer group flex items-center justify-center p-4 bg-white ${
                                                    selectedTemplateId ===
                                                    template.id
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
                                                    alt="Signature Template"
                                                    className="object-contain mix-blend-multiply w-24 h-12"
                                                />
                                                {template.isDefault && (
                                                    <div className="absolute top-2 left-2 bg-amber-500 text-white rounded-full p-1 shadow-sm">
                                                        <Star className="h-3 w-3" />
                                                    </div>
                                                )}
                                                {selectedTemplateId ===
                                                    template.id && (
                                                    <div className="absolute top-2 right-2 bg-undip-blue text-white rounded-full p-1 shadow-sm animate-in zoom-in">
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
                                            className="aspect-video rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-undip-blue hover:text-undip-blue transition-all cursor-pointer"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "template-upload",
                                                    )
                                                    ?.click()
                                            }
                                        >
                                            <input
                                                id="template-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file) {
                                                        const reader =
                                                            new FileReader();
                                                        reader.onloadend =
                                                            async () => {
                                                                const url =
                                                                    reader.result as string;
                                                                setIsSaving(
                                                                    true,
                                                                );
                                                                const toastId =
                                                                    toast.loading(
                                                                        "Mengunggah template...",
                                                                    );

                                                                try {
                                                                    const result =
                                                                        await saveSignature(
                                                                            {
                                                                                url,
                                                                                signatureType:
                                                                                    "TEMPLATE",
                                                                                isDefault:
                                                                                    templates.length ===
                                                                                    0,
                                                                            },
                                                                        );
                                                                    if (
                                                                        result.success &&
                                                                        result.data
                                                                    ) {
                                                                        setTemplates(
                                                                            (
                                                                                prev,
                                                                            ) => [
                                                                                result.data!,
                                                                                ...prev,
                                                                            ],
                                                                        );
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
                                                                        error instanceof
                                                                        Error
                                                                            ? error.message
                                                                            : "Terjadi kesalahan";
                                                                    console.error(
                                                                        "Template upload error:",
                                                                        error,
                                                                    );
                                                                    toast.error(
                                                                        errorMessage,
                                                                        {
                                                                            id: toastId,
                                                                        },
                                                                    );
                                                                } finally {
                                                                    setIsSaving(
                                                                        false,
                                                                    );
                                                                }
                                                            };
                                                        reader.readAsDataURL(
                                                            file,
                                                        );
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
                                        {templates.length === 0 &&
                                            !isLoading && (
                                                <div className="col-span-2 text-center py-8 text-slate-400">
                                                    <p className="text-sm">
                                                        Belum ada template
                                                        tersimpan
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        Upload template baru
                                                        untuk memulai
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent
                                value="canvas"
                                className="mt-0 focus-visible:outline-none"
                            >
                                <div className="space-y-4">
                                    <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm">
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            canvasProps={{
                                                className:
                                                    "w-full h-64 cursor-crosshair",
                                            }}
                                            onEnd={saveCanvas}
                                            backgroundColor="transparent"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50 p-3 rounded-3xl border border-slate-100">
                                        <div className="text-[11px] text-slate-500 font-medium">
                                            Gunakan kursor atau pen untuk
                                            membubuhkan tanda tangan dalam kotak
                                            di atas. Klik tombol &quot;Simpan
                                            Tanda Tangan&quot; di bawah setelah
                                            selesai.
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearCanvas}
                                            className="h-9 rounded-3xl border-slate-200 text-slate-600 hover:bg-white hover:text-red-500 hover:border-red-100 font-bold gap-1.5"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Bersihkan
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-3xl border border-blue-100">
                <div className="bg-white p-2.5 rounded-3xl shadow-sm text-undip-blue">
                    <Check className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">
                        Verifikasi Tanda Tangan Digital
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Tanda tangan yang Anda bubuhkan di sini akan otomatis
                        disematkan pada dokumen Surat Rekomendasi Beasiswa di
                        tahapan final publikasi. Pastikan tanda tangan terlihat
                        jelas.
                    </p>
                </div>
            </div>
        </div>
    );
}
