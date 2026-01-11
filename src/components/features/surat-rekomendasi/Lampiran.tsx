import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";

import type { FormDataType, LampiranFile } from "@/types/form";
import { uploadAttachment, deleteAttachment } from "@/lib/attachment-api";

interface LampiranProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function Lampiran({ data, setData }: LampiranProps) {
    const [selectedUtama, setSelectedUtama] = useState<string>("Semua");
    const [selectedTambahan, setSelectedTambahan] = useState<string>("Semua");
    const [dragActiveMain, setDragActiveMain] = useState(false);
    const [dragActiveTambahan, setDragActiveTambahan] = useState(false);
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingTambahan, setUploadingTambahan] = useState(false);

    const inferCategory = (file: File) => {
        const t = (file.type || "").toLowerCase();
        if (t.includes("pdf") || file.name.toLowerCase().endsWith(".pdf"))
            return "File";
        if (
            t.includes("image") ||
            file.name.toLowerCase().endsWith(".jpg") ||
            file.name.toLowerCase().endsWith(".jpeg") ||
            file.name.toLowerCase().endsWith(".png")
        )
            return "Foto";
        return "Lainnya";
    };

    const mainInputRef = useRef<HTMLInputElement | null>(null);
    const tambahanInputRef = useRef<HTMLInputElement | null>(null);

    /**
     * Upload main attachment files
     * Calls API untuk upload dan simpan metadata
     */
    const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        addMainFiles(files);
        if (mainInputRef.current) mainInputRef.current.value = "";
    };

    const addMainFiles = async (files: File[] | FileList) => {
        if (!files || !data.letterInstanceId) {
            alert(
                "Aplikasi harus dibuat terlebih dahulu. Klik Submit pada step sebelumnya."
            );
            return;
        }

        setUploadingMain(true);
        try {
            const arr: File[] =
                files instanceof FileList ? Array.from(files) : files;
            const existing = Array.isArray(data.lampiranUtama)
                ? data.lampiranUtama
                : [];
            const maxRemain = Math.max(0, 5 - existing.length);

            let uploaded = 0;
            for (const file of arr) {
                if (uploaded >= maxRemain) {
                    console.warn("Reached max 5 utama files limit");
                    break;
                }

                // Validate size
                if (file.size > 5 * 1024 * 1024) {
                    alert(
                        `${file.name} terlalu besar (max 5MB). File diabaikan.`
                    );
                    console.warn(
                        "File skipped due to size:",
                        file.name,
                        file.size
                    );
                    continue;
                }

                try {
                    // Call API to upload
                    const response = await uploadAttachment(
                        data.letterInstanceId,
                        file,
                        "Utama"
                    );

                    if (response) {
                        // Update state dengan response attachment
                        setData((prev) => {
                            const list = Array.isArray(prev.lampiranUtama)
                                ? prev.lampiranUtama
                                : [];
                            return {
                                ...prev,
                                lampiranUtama: [
                                    ...list,
                                    {
                                        id: response.data.id,
                                        name: response.data.filename,
                                        size: response.data.fileSize,
                                        type: response.data.mimeType,
                                        kategori: inferCategory(file),
                                        attachmentType:
                                            response.data.attachmentType,
                                        createdAt: response.data.createdAt,
                                    },
                                ],
                            };
                        });
                        uploaded++;
                    }
                } catch (error) {
                    console.error("Upload error for", file.name, ":", error);
                    alert(
                        `Gagal upload ${file.name}: ${
                            error instanceof Error
                                ? error.message
                                : "Unknown error"
                        }`
                    );
                }
            }
        } finally {
            setUploadingMain(false);
        }
    };

    /**
     * Upload additional attachment files
     */
    const handleAdditionalFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        addTambahanFiles(files);
        if (tambahanInputRef.current) tambahanInputRef.current.value = "";
    };

    const addTambahanFiles = async (files: File[] | FileList) => {
        if (!files || !data.letterInstanceId) {
            alert(
                "Aplikasi harus dibuat terlebih dahulu. Klik Submit pada step sebelumnya."
            );
            return;
        }

        setUploadingTambahan(true);
        try {
            const arr: File[] =
                files instanceof FileList ? Array.from(files) : files;
            const existing = Array.isArray(data.lampiranTambahan)
                ? data.lampiranTambahan
                : [];
            const maxRemain = Math.max(0, 3 - existing.length);

            let uploaded = 0;
            for (const file of arr) {
                if (uploaded >= maxRemain) {
                    console.warn("Reached max 3 tambahan files limit");
                    break;
                }

                // Validate size
                if (file.size > 5 * 1024 * 1024) {
                    alert(
                        `${file.name} terlalu besar (max 5MB). File diabaikan.`
                    );
                    console.warn(
                        "File skipped due to size:",
                        file.name,
                        file.size
                    );
                    continue;
                }

                try {
                    // Call API to upload
                    const response = await uploadAttachment(
                        data.letterInstanceId,
                        file,
                        "Tambahan"
                    );

                    if (response) {
                        // Update state dengan response attachment
                        setData((prev) => {
                            const list = Array.isArray(prev.lampiranTambahan)
                                ? prev.lampiranTambahan
                                : [];
                            return {
                                ...prev,
                                lampiranTambahan: [
                                    ...list,
                                    {
                                        id: response.data.id,
                                        name: response.data.filename,
                                        size: response.data.fileSize,
                                        type: response.data.mimeType,
                                        kategori: inferCategory(file),
                                        attachmentType:
                                            response.data.attachmentType,
                                        createdAt: response.data.createdAt,
                                    },
                                ],
                            };
                        });
                        uploaded++;
                    }
                } catch (error) {
                    console.error("Upload error for", file.name, ":", error);
                    alert(
                        `Gagal upload ${file.name}: ${
                            error instanceof Error
                                ? error.message
                                : "Unknown error"
                        }`
                    );
                }
            }
        } finally {
            setUploadingTambahan(false);
        }
    };

    const handleDelete = async (which: "utama" | "tambahan", idx: number) => {
        // Open confirmation modal instead of immediate deletion
        const list =
            which === "utama" ? data.lampiranUtama : data.lampiranTambahan;
        const file = Array.isArray(list) ? list[idx] : null;

        if (!file || !file.id) {
            alert("File tidak ditemukan");
            return;
        }

        setConfirmDelete({ open: true, which, idx });
    };

    // Confirmation modal state and actions
    const [confirmDelete, setConfirmDelete] = useState<{
        open: boolean;
        which: "utama" | "tambahan" | null;
        idx: number | null;
    }>({ open: false, which: null, idx: null });

    const confirmDeleteCancel = () => {
        setConfirmDelete({ open: false, which: null, idx: null });
    };

    const confirmDeleteProceed = async () => {
        const { which, idx } = confirmDelete;
        if (!which || idx === null) return confirmDeleteCancel();

        const list =
            which === "utama" ? data.lampiranUtama : data.lampiranTambahan;
        const file = Array.isArray(list) ? list[idx] : null;
        if (!file || !file.id) {
            alert("File tidak ditemukan");
            return confirmDeleteCancel();
        }

        try {
            await deleteAttachment(file.id);

            if (which === "utama") {
                setData((prev) => {
                    const list = Array.isArray(prev.lampiranUtama)
                        ? [...prev.lampiranUtama]
                        : [];
                    list.splice(idx, 1);
                    return { ...prev, lampiranUtama: list };
                });
            } else {
                setData((prev) => {
                    const list = Array.isArray(prev.lampiranTambahan)
                        ? [...prev.lampiranTambahan]
                        : [];
                    list.splice(idx, 1);
                    return { ...prev, lampiranTambahan: list };
                });
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert(
                `Gagal hapus file: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            confirmDeleteCancel();
        }
    };

    // Preview modal
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<"pdf" | "image" | null>(
        null
    );

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleViewFile = (which: "utama" | "tambahan", idx: number) => {
        const list =
            which === "utama" ? data.lampiranUtama : data.lampiranTambahan;
        const f = Array.isArray(list) ? list[idx] : null;
        if (!f) return;

        // For files uploaded to API, use downloadUrl if available, or open in new tab
        // For now, just show message that preview is available
        alert(
            `File: ${f.name}\nUntuk preview, silakan download dari halaman detail aplikasi.`
        );
    };

    const handleClosePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewType(null);
    };

    const formatSize = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <section aria-label="Upload Lampiran">
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8 space-y-4">
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-gray-800">
                            Lampiran Utama{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-gray-500 -mt-2">
                            Wajib. Unggah minimal 1 dokumen pendukung utama.
                            Format: PDF, JPG, PNG. Maks: 5MB/file.
                        </p>

                        <div
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition ${
                                dragActiveMain
                                    ? "bg-blue-50 border-blue-400"
                                    : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                            } ${
                                uploadingMain
                                    ? "opacity-60 bg-gray-50"
                                    : "cursor-pointer group hover:"
                            } `}
                            onClick={() =>
                                !uploadingMain && mainInputRef.current?.click()
                            }
                            onDragOver={(e) => {
                                if (!uploadingMain) e.preventDefault();
                            }}
                            onDragEnter={(e) => {
                                if (!uploadingMain) {
                                    e.preventDefault();
                                    setDragActiveMain(true);
                                }
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setDragActiveMain(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActiveMain(false);
                                if (!uploadingMain && e.dataTransfer?.files)
                                    addMainFiles(e.dataTransfer.files);
                            }}
                        >
                            <div
                                className={`bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] ${
                                    !uploadingMain
                                        ? "group-hover:scale-110 transition-transform"
                                        : ""
                                }`}
                            >
                                <BsFileEarmarkArrowUp
                                    size={24}
                                    className={
                                        uploadingMain ? "animate-bounce" : ""
                                    }
                                />
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                {uploadingMain
                                    ? "Sedang mengunggah..."
                                    : "Seret & lepas atau "}
                                {!uploadingMain && (
                                    <span className="text-[#007bff] font-bold">
                                        klik area
                                    </span>
                                )}
                            </div>
                            <input
                                ref={mainInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleMainFileChange}
                                disabled={uploadingMain}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                untuk diunggah
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-gray-800">
                            Lampiran Tambahan
                        </Label>
                        <p className="text-xs text-gray-500 -mt-2">
                            Opsional. Tambahkan dokumen pendukung lainnya jika
                            diperlukan.
                        </p>

                        <div
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition ${
                                dragActiveTambahan
                                    ? "bg-blue-50 border-blue-400"
                                    : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                            } ${
                                uploadingTambahan
                                    ? "opacity-60 bg-gray-50"
                                    : "cursor-pointer group hover:"
                            }`}
                            onClick={() =>
                                !uploadingTambahan &&
                                tambahanInputRef.current?.click()
                            }
                            onDragOver={(e) => {
                                if (!uploadingTambahan) e.preventDefault();
                            }}
                            onDragEnter={(e) => {
                                if (!uploadingTambahan) {
                                    e.preventDefault();
                                    setDragActiveTambahan(true);
                                }
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setDragActiveTambahan(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActiveTambahan(false);
                                if (!uploadingTambahan && e.dataTransfer?.files)
                                    addTambahanFiles(e.dataTransfer.files);
                            }}
                        >
                            <div
                                className={`bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] ${
                                    !uploadingTambahan
                                        ? "group-hover:scale-110 transition-transform"
                                        : ""
                                }`}
                            >
                                <BsFileEarmarkArrowUp
                                    size={24}
                                    className={
                                        uploadingTambahan
                                            ? "animate-bounce"
                                            : ""
                                    }
                                />
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                {uploadingTambahan
                                    ? "Sedang mengunggah..."
                                    : "Seret & lepas atau "}
                                {!uploadingTambahan && (
                                    <span className="text-[#007bff] font-bold">
                                        klik area
                                    </span>
                                )}
                            </div>
                            <input
                                ref={tambahanInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleAdditionalFileChange}
                                disabled={uploadingTambahan}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                untuk diunggah
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6 border-none shadow-sm bg-white">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-gray-800">
                                Ringkasan Lampiran Utama
                            </Label>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-600">
                                    Tampilkan:
                                </div>
                                <Select
                                    value={selectedUtama}
                                    onValueChange={setSelectedUtama}
                                >
                                    <SelectTrigger className="h-9 w-[160px] text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">Semua</SelectItem>
                                        <SelectItem value="File">File (PDF)</SelectItem>
                                        <SelectItem value="Foto">Foto (JPG/PNG)</SelectItem>
                                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {Array.isArray(data.lampiranUtama) &&
                        data.lampiranUtama.length > 0 ? (
                            <ul className="space-y-3">
                                {data.lampiranUtama
                                    .filter((f: LampiranFile) =>
                                        selectedUtama === "Semua"
                                            ? true
                                            : f.kategori === selectedUtama
                                    )
                                    .map((f: LampiranFile, idx: number) => (
                                        <li
                                            key={`preview-u-${idx}`}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-medium truncate">
                                                    {f.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {f.kategori ||
                                                        "(Tidak tersedia)"}{" "}
                                                    •{" "}
                                                    {formatSize(
                                                        Number(f.size) || 0
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleViewFile(
                                                            "utama",
                                                            idx
                                                        )
                                                    }
                                                    className="h-9"
                                                >
                                                    Lihat
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            className="h-9"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Hapus File?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Yakin ingin menghapus file <strong>{f.name}</strong>? 
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Batal
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        "utama",
                                                                        idx
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Belum ada lampiran utama yang diunggah.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8 border-none shadow-sm bg-white">
                <CardContent className="p-8 space-y-4">
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-gray-800">
                            Lampiran Tambahan
                        </Label>
                        <p className="text-xs text-gray-500 -mt-2">
                            Opsional. Tambahkan dokumen pendukung lainnya jika
                            diperlukan.
                        </p>

                        <div
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition cursor-pointer group ${
                                dragActiveTambahan
                                    ? "bg-blue-50 border-blue-400"
                                    : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                            }`}
                            onClick={() => tambahanInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                setDragActiveTambahan(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setDragActiveTambahan(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActiveTambahan(false);
                                if (e.dataTransfer?.files)
                                    addTambahanFiles(e.dataTransfer.files);
                            }}
                        >
                            <div className="bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] group-hover:scale-110 transition-transform">
                                <BsFileEarmarkArrowUp size={24} />
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                Seret &amp; lepas atau{" "}
                                <span className="text-[#007bff] font-bold">
                                    klik area
                                </span>
                            </div>
                            <input
                                ref={tambahanInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleAdditionalFileChange}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                untuk diunggah
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6 border-none shadow-sm bg-white">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-gray-800">
                                Ringkasan Lampiran Tambahan
                            </Label>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-600">
                                    Tampilkan:
                                </div>
                                <Select
                                    value={selectedTambahan}
                                    onValueChange={setSelectedTambahan}
                                >
                                    <SelectTrigger className="h-9 w-[160px] text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">Semua</SelectItem>
                                        <SelectItem value="File">File (PDF)</SelectItem>
                                        <SelectItem value="Foto">Foto (JPG/PNG)</SelectItem>
                                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {Array.isArray(data.lampiranTambahan) &&
                        data.lampiranTambahan.length > 0 ? (
                            <ul className="space-y-3">
                                {data.lampiranTambahan
                                    .filter((f: LampiranFile) =>
                                        selectedTambahan === "Semua"
                                            ? true
                                            : f.kategori === selectedTambahan
                                    )
                                    .map((f: LampiranFile, idx: number) => (
                                        <li
                                            key={`preview-t-${idx}`}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-medium truncate">
                                                    {f.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {f.kategori ||
                                                        "(Tidak tersedia)"}{" "}
                                                    •{" "}
                                                    {formatSize(
                                                        Number(f.size) || 0
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleViewFile(
                                                            "tambahan",
                                                            idx
                                                        )
                                                    }
                                                    className="h-9"
                                                >
                                                    Lihat
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            className="h-9"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Hapus File?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Yakin ingin menghapus file <strong>{f.name}</strong>? 
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Batal
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        "tambahan",
                                                                        idx
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Belum ada lampiran tambahan yang diunggah.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Preview modal */}
            {confirmDelete.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg overflow-hidden w-[90%] max-w-md p-4">
                        <div className="text-sm font-medium text-gray-800 mb-4">
                            Yakin ingin menghapus file ini?
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={confirmDeleteCancel}
                                className="h-9"
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDeleteProceed}
                                className="h-9"
                            >
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg overflow-hidden w-[90%] max-w-3xl">
                        <div className="flex justify-end p-2">
                            <Button
                                variant="ghost"
                                onClick={handleClosePreview}
                                className="text-sm"
                            >
                                Tutup
                            </Button>
                        </div>
                        <div className="p-4">
                            {previewType === "pdf" ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-[70vh]"
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-auto max-h-[70vh] object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
