"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Upload,
    Trash2,
    Star,
    Loader2,
    AlertCircle,
    PenTool,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    getSignatures,
    saveSignature,
    setDefaultSignature,
    deleteSignature,
    UserSignature,
} from "@/lib/application-api";
import { SignatureImage } from "@/components/ui/signature-image";

export function WD1SignatureDashboard() {
    const [signatures, setSignatures] = useState<UserSignature[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // Load signatures on mount
    useEffect(() => {
        loadSignatures();
    }, []);

    const loadSignatures = async () => {
        setLoading(true);
        try {
            const data = await getSignatures();
            setSignatures(data);
        } catch (error) {
            toast.error("Gagal memuat template tanda tangan");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
                return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("File harus berupa gambar (JPG, PNG, GIF, etc)");
                return;
            }

            setIsUploading(true);
            const toastId = toast.loading(
                "Mengunggah template tanda tangan...",
            );

            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const result = await saveSignature({
                        url: reader.result as string,
                        signatureType: "TEMPLATE",
                    });

                    if (result.success && result.data) {
                        setSignatures((prev) => [result.data!, ...prev]);
                        toast.success(
                            "Template tanda tangan berhasil diunggah",
                            {
                                id: toastId,
                            },
                        );
                        setUploadDialogOpen(false);
                    } else {
                        toast.error(
                            result.error || "Gagal mengunggah template",
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
                    console.error("Template upload error:", error);
                    toast.error(errorMessage, { id: toastId });
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const success = await setDefaultSignature(id);
            if (success) {
                setSignatures((prev) =>
                    prev.map((sig) => ({ ...sig, isDefault: sig.id === id })),
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

    const handleDelete = async (id: string) => {
        try {
            const success = await deleteSignature(id);
            if (success) {
                setSignatures((prev) => prev.filter((sig) => sig.id !== id));
                toast.success("Template berhasil dihapus");
            } else {
                toast.error("Gagal menghapus template");
            }
        } catch (error) {
            console.error("Delete template error:", error);
            toast.error("Terjadi kesalahan saat menghapus template");
        }
    };

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-3xl">
                            <PenTool className="h-6 w-6 text-undip-blue" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-slate-800">
                                Daftar Template Tanda Tangan
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1">
                                Kelola dan organisir template tanda tangan Anda
                            </p>
                        </div>
                    </div>
                    <Dialog
                        open={uploadDialogOpen}
                        onOpenChange={setUploadDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-undip-blue hover:bg-sky-700 rounded-3xl">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Template Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-3xl">
                            <DialogHeader>
                                <DialogTitle>
                                    Upload Template Tanda Tangan
                                </DialogTitle>
                                <DialogDescription>
                                    Pilih file gambar tanda tangan untuk
                                    dijadikan template. Format PNG dengan
                                    background transparan disarankan.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center hover:border-undip-blue transition-colors cursor-pointer">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-undip-blue mb-2" />
                                        <p className="font-semibold text-sm">
                                            {isUploading
                                                ? "Sedang mengunggah..."
                                                : "Klik atau seret file di sini"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF (max 5MB)
                                        </p>
                                    </label>
                                </div>

                                {isUploading && (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-undip-blue" />
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : signatures.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                            Belum ada template tanda tangan
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Upload template pertama Anda untuk memulai
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {signatures.map((signature) => (
                            <div
                                key={signature.id}
                                className="border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white"
                            >
                                {/* Signature Preview */}
                                <div className="aspect-video bg-gray-50 flex items-center justify-center border-b p-4">
                                    <SignatureImage
                                        src={signature.url}
                                        alt="Signature Preview"
                                        className="object-contain w-full h-full"
                                    />
                                </div>

                                {/* Signature Info */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <p className="font-semibold text-slate-800">
                                                Template{" "}
                                                {signatures.indexOf(signature) +
                                                    1}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(
                                                    signature.createdAt,
                                                ).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                        {signature.isDefault && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                                                <Star className="h-3 w-3 text-yellow-600 fill-yellow-600" />
                                                <span className="text-xs font-semibold text-yellow-700">
                                                    Default
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        {!signature.isDefault && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleSetDefault(
                                                        signature.id,
                                                    )
                                                }
                                                className="flex-1 text-xs rounded-3xl"
                                            >
                                                <Star className="h-3 w-3 mr-1" />
                                                Jadikan Default
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleDelete(signature.id)
                                            }
                                            className="text-red-600 border-red-200 hover:bg-red-50 rounded-3xl"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
