"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
    Loader2,
    Upload,
    RefreshCw,
    AlertCircle,
    Star,
    Trash2,
    Pencil,
    Check,
    X,
} from "lucide-react";
import { SignatureImage } from "@/components/ui/signature-image";
import {
    getStamps,
    saveStamp,
    setDefaultStamp,
    deleteStamp,
    renameStamp,
    UserStamp,
} from "@/lib/application-api";

export function UPAStampDashboard() {
    const [stamps, setStamps] = useState<UserStamp[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

    // Load stamps on mount
    useEffect(() => {
        loadStamps();
    }, []);

    const loadStamps = async () => {
        setLoading(true);
        try {
            const data = await getStamps();
            setStamps(data);
        } catch (error) {
            toast.error(
                "Gagal memuat template stempel. Silakan refresh halaman atau hubungi administrator",
            );
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

            setIsUploading(true);
            const toastId = toast.loading("Mengunggah template stempel...");

            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const result = await saveStamp({
                        url: reader.result as string,
                        stampType: "TEMPLATE",
                    });

                    if (result.success && result.data) {
                        // Re-fetch to get fresh presigned URLs so images render immediately
                        await loadStamps();
                        toast.success(
                            "Template stempel berhasil diunggah! Template siap digunakan",
                            {
                                id: toastId,
                            },
                        );
                        setUploadDialogOpen(false);
                        // Reset file input
                        const input = document.getElementById(
                            "file-upload",
                        ) as HTMLInputElement;
                        if (input) input.value = "";
                    } else {
                        toast.error(
                            result.error ||
                                "Gagal mengunggah template. Periksa file dan coba lagi",
                            { id: toastId },
                        );
                    }
                } catch (error) {
                    toast.error(
                        "Terjadi kesalahan sistem saat mengunggah. Silakan coba lagi",
                        {
                            id: toastId,
                        },
                    );
                    console.error(error);
                } finally {
                    setIsUploading(false);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const success = await setDefaultStamp(id);
            if (success) {
                setStamps((prev) =>
                    prev.map((s) => ({ ...s, isDefault: s.id === id })),
                );
                toast.success(
                    "Stempel berhasil dijadikan default! Stempel ini akan digunakan secara otomatis",
                );
            } else {
                toast.error(
                    "Gagal mengatur stempel default. Silakan coba lagi",
                );
            }
        } catch (error) {
            console.error("Set default error:", error);
            toast.error(
                "Terjadi kesalahan sistem saat mengatur default. Hubungi administrator",
            );
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const success = await deleteStamp(id);
            if (success) {
                setStamps((prev) => prev.filter((s) => s.id !== id));
                toast.success("Stempel berhasil dihapus dari sistem");
            } else {
                toast.error("Gagal menghapus stempel. Silakan coba lagi");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(
                "Terjadi kesalahan sistem saat menghapus. Hubungi administrator",
            );
        }
    };

    const startRename = (stamp: UserStamp, index: number) => {
        setRenamingId(stamp.id);
        setRenameValue(stamp.name || `Stempel ${index + 1}`);
    };

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue("");
    };

    const handleRename = async (id: string) => {
        const trimmed = renameValue.trim();
        if (!trimmed) {
            toast.error("Nama template tidak boleh kosong");
            return;
        }
        const success = await renameStamp(id, trimmed);
        if (success) {
            setStamps((prev) =>
                prev.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
            );
            toast.success("Nama template berhasil diperbarui");
        } else {
            toast.error("Gagal memperbarui nama. Silakan coba lagi");
        }
        setRenamingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Upload Button */}
            <div className="flex justify-end">
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
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Upload Template Stempel</DialogTitle>
                            <DialogDescription>
                                Pilih file gambar stempel untuk dijadikan
                                template. Format PNG dengan background
                                transparan disarankan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center hover:border-undip-blue transition-colors cursor-pointer">
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

            {/* Stamps Grid */}
            <div className="bg-white rounded-3xl border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                        Template Stempel ({stamps.length})
                    </h3>
                    <Button onClick={loadStamps} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : stamps.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                            Belum ada template stempel
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Upload template pertama Anda untuk memulai
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {stamps.map((stamp) => (
                            <div
                                key={stamp.id}
                                className="border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white"
                            >
                                {/* Stamp Preview */}
                                <div className="aspect-video bg-gray-50 flex items-center justify-center border-b p-4">
                                    <SignatureImage
                                        src={stamp.url}
                                        alt="Stamp Preview"
                                        className="object-contain w-full h-full mix-blend-multiply"
                                    />
                                </div>

                                {/* Stamp Info */}
                                <div className="p-3 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {renamingId === stamp.id ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        autoFocus
                                                        value={renameValue}
                                                        onChange={(e) =>
                                                            setRenameValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            )
                                                                handleRename(
                                                                    stamp.id,
                                                                );
                                                            if (
                                                                e.key ===
                                                                "Escape"
                                                            )
                                                                cancelRename();
                                                        }}
                                                        className="w-full text-sm font-semibold border border-undip-blue rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-undip-blue/30"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            handleRename(
                                                                stamp.id,
                                                            )
                                                        }
                                                        className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 shrink-0"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={cancelRename}
                                                        className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {stamp.name ||
                                                            `Stempel ${stamps.indexOf(stamp) + 1}`}
                                                    </p>
                                                    <button
                                                        onClick={() =>
                                                            startRename(
                                                                stamp,
                                                                stamps.indexOf(
                                                                    stamp,
                                                                ),
                                                            )
                                                        }
                                                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 shrink-0"
                                                        title="Ubah nama"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {stamp.stampType === "TEMPLATE"
                                                    ? "Template"
                                                    : stamp.stampType ===
                                                        "UPLOADED"
                                                      ? "Unggahan"
                                                      : "Coretan"}
                                            </p>
                                        </div>
                                        {stamp.isDefault && (
                                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold shrink-0">
                                                <Star className="h-3 w-3" />
                                                Default
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Dibuat:{" "}
                                        {new Date(
                                            stamp.createdAt,
                                        ).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t">
                                        {!stamp.isDefault && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white hover:text-white rounded-3xl"
                                                onClick={() =>
                                                    handleSetDefault(stamp.id)
                                                }
                                            >
                                                <Star className="h-3.5 w-3.5 mr-1" />
                                                Jadikan Default
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:text-white rounded-3xl"
                                            onClick={() =>
                                                handleDelete(stamp.id)
                                            }
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
