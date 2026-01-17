import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";

import type { FormDataType, LampiranFile } from "@/types/form";
import {
    uploadAttachment,
    deleteAttachment,
    createApplication,
} from "@/lib/attachment-api";

interface LampiranProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Tutup pesan kesalahan otomatis setelah 5 detik
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Fungsi validasi file
    const isValidFormat = (file: File): boolean => {
        const allowedFormats = [".pdf", ".jpg", ".png"];
        const fileName = file.name.toLowerCase();
        return allowedFormats.some((format) => fileName.endsWith(format));
    };

    const isValidSize = (file: File): boolean => {
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        return file.size <= maxSize;
    };

    const inferCategory = (file: File) => {
        const t = (file.type || "").toLowerCase();
        if (t.includes("pdf") || file.name.toLowerCase().endsWith(".pdf"))
            return "File";
        if (
            t.includes("image") ||
            file.name.toLowerCase().endsWith(".jpg") ||
            file.name.toLowerCase().endsWith(".png")
        )
            return "Foto";
        return "Lainnya";
    };

    const mainInputRef = useRef<HTMLInputElement | null>(null);
    const tambahanInputRef = useRef<HTMLInputElement | null>(null);

    // Tambahkan file utama, batasi maksimal 5, validasi ukuran -> unggah ke API
    const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        addMainFiles(files);
        if (mainInputRef.current) mainInputRef.current.value = "";
    };

    const addMainFiles = async (files: File[] | FileList) => {
        if (!files) return;

        const arr: File[] =
            files instanceof FileList ? Array.from(files) : files;

        // Check max file limit first
        const existing = Array.isArray(data.lampiranUtama)
            ? data.lampiranUtama
            : [];
        if (existing.length >= 5) {
            setErrorMessage("Maksimal 5 file");
            return;
        }

        // Validate all files first
        for (const file of arr) {
            if (!isValidFormat(file)) {
                setErrorMessage("Format file tidak didukung");
                return;
            }
            if (!isValidSize(file)) {
                setErrorMessage("Ukuran file maksimal 5MB");
                return;
            }
        }

        // Clear any previous error
        setErrorMessage(null);

        // Periksa apakah mencoba mengunggah lebih banyak file daripada kapasitas
        const maxRemain = Math.max(0, 5 - existing.length);
        if (arr.length > maxRemain) {
            setErrorMessage("Maksimal 5 file");
        }

        // pastikan kita memiliki letterId yang valid untuk digunakan
        let letterId: string | undefined = data.letterInstanceId;
        if (!letterId) {
            try {
                const created = await createApplication(
                    data.namaBeasiswa || "Surat Rekomendasi",
                    (data as unknown as Record<string, unknown>) || {}
                );
                letterId = created.id;
                setData((prev) => ({ ...prev, letterInstanceId: created.id }));
            } catch (err) {
                console.error("Auto-create application failed:", err);
                setErrorMessage(
                    "Gagal membuat aplikasi otomatis. Silakan submit pada langkah sebelumnya atau coba lagi."
                );
                return;
            }
        }

        if (!letterId) return;

        setUploadingMain(true);
        try {
            let uploaded = 0;
            for (const file of arr) {
                if (uploaded >= maxRemain) break;

                try {
                    const res = await uploadAttachment(letterId, file, "Utama");
                    if (res) {
                        setData((prev) => ({
                            ...prev,
                            lampiranUtama: [
                                ...(Array.isArray(prev.lampiranUtama)
                                    ? prev.lampiranUtama
                                    : []),
                                {
                                    id: res.data.id,
                                    name: res.data.filename,
                                    size: res.data.fileSize,
                                    type: res.data.mimeType,
                                    kategori: inferCategory(file),
                                    attachmentType: res.data.attachmentType,
                                    downloadUrl: res.data.downloadUrl,
                                    createdAt: res.data.createdAt,
                                },
                            ],
                        }));
                        uploaded++;
                    }
                } catch (err) {
                    console.error("Upload error:", err);
                    alert(
                        `Gagal upload ${file.name}: ${
                            err instanceof Error ? err.message : String(err)
                        }`
                    );
                }
            }
        } finally {
            setUploadingMain(false);
        }
    };

    // Tambahkan file tambahan, batasi maksimal 3, validasi ukuran -> unggah ke API
    const handleAdditionalFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        addTambahanFiles(files);
        if (tambahanInputRef.current) tambahanInputRef.current.value = "";
    };

    const addTambahanFiles = async (files: File[] | FileList) => {
        if (!files) return;

        const arr: File[] =
            files instanceof FileList ? Array.from(files) : files;

        // Check max file limit first
        const existing = Array.isArray(data.lampiranTambahan)
            ? data.lampiranTambahan
            : [];
        if (existing.length >= 3) {
            setErrorMessage("Maksimal 3 file");
            return;
        }

        // Validate all files first
        for (const file of arr) {
            if (!isValidFormat(file)) {
                setErrorMessage("Format file tidak didukung");
                return;
            }
            if (!isValidSize(file)) {
                setErrorMessage("Ukuran file maksimal 5MB");
                return;
            }
        }

        // Clear any previous error
        setErrorMessage(null);

        // Check if trying to upload more files than capacity
        const maxRemain = Math.max(0, 3 - existing.length);
        if (arr.length > maxRemain) {
            setErrorMessage("Maksimal 3 file");
        }

        let letterId: string | undefined = data.letterInstanceId;
        if (!letterId) {
            try {
                const created = await createApplication(
                    data.namaBeasiswa || "Surat Rekomendasi",
                    (data as unknown as Record<string, unknown>) || {}
                );
                letterId = created.id;
                setData((prev) => ({ ...prev, letterInstanceId: created.id }));
            } catch (err) {
                console.error("Auto-create application failed:", err);
                setErrorMessage(
                    "Gagal membuat aplikasi otomatis. Silakan submit pada langkah sebelumnya atau coba lagi."
                );
                return;
            }
        }

        if (!letterId) return;

        setUploadingTambahan(true);
        try {
            let uploaded = 0;
            for (const file of arr) {
                if (uploaded >= maxRemain) break;

                try {
                    const res = await uploadAttachment(
                        letterId,
                        file,
                        "Tambahan"
                    );
                    if (res) {
                        setData((prev) => ({
                            ...prev,
                            lampiranTambahan: [
                                ...(Array.isArray(prev.lampiranTambahan)
                                    ? prev.lampiranTambahan
                                    : []),
                                {
                                    id: res.data.id,
                                    name: res.data.filename,
                                    size: res.data.fileSize,
                                    type: res.data.mimeType,
                                    kategori: inferCategory(file),
                                    attachmentType: res.data.attachmentType,
                                    downloadUrl: res.data.downloadUrl,
                                    createdAt: res.data.createdAt,
                                },
                            ],
                        }));
                        uploaded++;
                    }
                } catch (err) {
                    console.error("Upload error:", err);
                    setErrorMessage(
                        `Gagal upload ${file.name}: ${
                            err instanceof Error ? err.message : String(err)
                        }`
                    );
                }
            }
        } finally {
            setUploadingTambahan(false);
        }
    };

    const handleDelete = async (which: "utama" | "tambahan", idx: number) => {
        const list =
            which === "utama" ? data.lampiranUtama : data.lampiranTambahan;
        const file = Array.isArray(list) ? list[idx] : null;
        if (!file) return;

        if (file.id) {
            try {
                await deleteAttachment(file.id);
            } catch (err) {
                console.error("Delete error:", err);
                setErrorMessage(
                    `Gagal hapus file: ${
                        err instanceof Error ? err.message : String(err)
                    }`
                );
                return;
            }
        }

        // hapus dari state
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
    };

    // Modal pratinjau
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

        const attachment = f as LampiranFile & {
            downloadUrl?: string;
            file?: File;
        };
        if (attachment.downloadUrl) {
            const t = (attachment.type || "").toLowerCase();
            if (
                t.includes("pdf") ||
                attachment.name.toLowerCase().endsWith(".pdf")
            )
                setPreviewType("pdf");
            else setPreviewType("image");
            setPreviewUrl(attachment.downloadUrl);
            return;
        }

        if (attachment.file) {
            const fileObj = attachment.file as File;
            const url = URL.createObjectURL(fileObj);
            const t = (fileObj.type || fileObj.name).toLowerCase();
            if (
                t.includes("pdf") ||
                fileObj.name.toLowerCase().endsWith(".pdf")
            )
                setPreviewType("pdf");
            else setPreviewType("image");
            setPreviewUrl(url);
        }
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
            {errorMessage && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
                    <Alert
                        variant="destructive"
                        className="shadow-lg min-w-[320px] max-w-md"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="flex items-start justify-between gap-2">
                            <span>{errorMessage}</span>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="text-red-500 hover:text-red-700 font-bold"
                            >
                                ×
                            </button>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

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
                            <br />
                            <span className="text-red-500">
                                Maksimal 5 file.
                            </span>
                        </p>

                        <div
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition ${
                                uploadingMain
                                    ? "opacity-60 bg-gray-50 cursor-not-allowed"
                                    : "cursor-pointer group"
                            } ${
                                dragActiveMain
                                    ? "bg-blue-50 border-blue-400"
                                    : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                            }`}
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
                                if (!uploadingMain) {
                                    e.preventDefault();
                                    setDragActiveMain(false);
                                }
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActiveMain(false);
                                if (!uploadingMain && e.dataTransfer?.files)
                                    addMainFiles(e.dataTransfer.files);
                            }}
                        >
                            {uploadingMain ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Spinner className="size-8 text-[#007bff]" />
                                    <p className="text-sm text-gray-600">
                                        Mengunggah file...
                                    </p>
                                </div>
                            ) : (
                                <>
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
                                        ref={mainInputRef}
                                        type="file"
                                        accept=".pdf,.jpg,.png"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleMainFileChange}
                                        disabled={uploadingMain}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        untuk diunggah
                                    </p>
                                </>
                            )}
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
                                    <SelectTrigger className="h-9 w-40 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="File">
                                            File (PDF)
                                        </SelectItem>
                                        <SelectItem value="Foto">
                                            Foto (JPG/PNG)
                                        </SelectItem>
                                        <SelectItem value="Lainnya">
                                            Lainnya
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {Array.isArray(data.lampiranUtama) &&
                        data.lampiranUtama.length > 0 ? (
                            (() => {
                                const filteredFiles = data.lampiranUtama.filter(
                                    (f: LampiranFile) =>
                                        selectedUtama === "Semua"
                                            ? true
                                            : f.kategori === selectedUtama
                                );

                                if (filteredFiles.length === 0) {
                                    let message = "";
                                    if (selectedUtama === "File") {
                                        message =
                                            "Belum ada Lampiran File yang diunggah";
                                    } else if (selectedUtama === "Foto") {
                                        message =
                                            "Belum ada Lampiran Foto yang diunggah";
                                    } else if (selectedUtama === "Lainnya") {
                                        message =
                                            "Belum ada Lampiran Lainnya yang diunggah";
                                    }
                                    return (
                                        <div className="text-sm text-gray-500">
                                            {message}
                                        </div>
                                    );
                                }

                                return (
                                    <ul className="space-y-3">
                                        {filteredFiles.map(
                                            (f: LampiranFile, idx: number) => (
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
                                                                Number(
                                                                    f.size
                                                                ) || 0
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
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
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
                                                                        Hapus
                                                                        File?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Yakin
                                                                        ingin
                                                                        menghapus
                                                                        file{" "}
                                                                        <strong>
                                                                            {
                                                                                f.name
                                                                            }
                                                                        </strong>
                                                                        ?
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
                                            )
                                        )}
                                    </ul>
                                );
                            })()
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
                            <br />
                            <span className="text-red-500">
                                Maksimal 3 file.
                            </span>
                        </p>

                        <div
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition ${
                                uploadingTambahan
                                    ? "opacity-60 bg-gray-50 cursor-not-allowed"
                                    : "cursor-pointer group"
                            } ${
                                dragActiveTambahan
                                    ? "bg-blue-50 border-blue-400"
                                    : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
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
                                if (!uploadingTambahan) {
                                    e.preventDefault();
                                    setDragActiveTambahan(false);
                                }
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActiveTambahan(false);
                                if (!uploadingTambahan && e.dataTransfer?.files)
                                    addTambahanFiles(e.dataTransfer.files);
                            }}
                        >
                            {uploadingTambahan ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Spinner className="size-8 text-[#007bff]" />
                                    <p className="text-sm text-gray-600">
                                        Mengunggah file...
                                    </p>
                                </div>
                            ) : (
                                <>
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
                                        accept=".pdf,.jpg,.png"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleAdditionalFileChange}
                                        disabled={uploadingTambahan}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        untuk diunggah
                                    </p>
                                </>
                            )}
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
                                    <SelectTrigger className="h-9 w-40 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="File">
                                            File (PDF)
                                        </SelectItem>
                                        <SelectItem value="Foto">
                                            Foto (JPG/PNG)
                                        </SelectItem>
                                        <SelectItem value="Lainnya">
                                            Lainnya
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {Array.isArray(data.lampiranTambahan) &&
                        data.lampiranTambahan.length > 0 ? (
                            (() => {
                                const filteredFiles =
                                    data.lampiranTambahan.filter(
                                        (f: LampiranFile) =>
                                            selectedTambahan === "Semua"
                                                ? true
                                                : f.kategori ===
                                                  selectedTambahan
                                    );

                                if (filteredFiles.length === 0) {
                                    let message = "";
                                    if (selectedTambahan === "File") {
                                        message =
                                            "Belum ada Lampiran File yang diunggah";
                                    } else if (selectedTambahan === "Foto") {
                                        message =
                                            "Belum ada Lampiran Foto yang diunggah";
                                    } else if (selectedTambahan === "Lainnya") {
                                        message =
                                            "Belum ada Lampiran Lainnya yang diunggah";
                                    }
                                    return (
                                        <div className="text-sm text-gray-500">
                                            {message}
                                        </div>
                                    );
                                }

                                return (
                                    <ul className="space-y-3">
                                        {filteredFiles.map(
                                            (f: LampiranFile, idx: number) => (
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
                                                                Number(
                                                                    f.size
                                                                ) || 0
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
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
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
                                                                        Hapus
                                                                        File?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Yakin
                                                                        ingin
                                                                        menghapus
                                                                        file{" "}
                                                                        <strong>
                                                                            {
                                                                                f.name
                                                                            }
                                                                        </strong>
                                                                        ?
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
                                            )
                                        )}
                                    </ul>
                                );
                            })()
                        ) : (
                            <div className="text-sm text-gray-500">
                                Belum ada lampiran tambahan yang diunggah.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

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
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-auto max-h-[70vh] object-contain"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
