import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";

import type { FormDataType, LampiranFile } from "@/types/form";

interface LampiranProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function Lampiran({ data, setData }: LampiranProps) {
    const [selectedUtama, setSelectedUtama] = useState<string>("Semua");
    const [selectedTambahan, setSelectedTambahan] = useState<string>("Semua");

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

    // Append main files, enforce max 5, validate size
    const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const arr = Array.from(files);
        const accepted: File[] = [];
        for (const f of arr) {
            if (f.size > 5 * 1024 * 1024) {
                // eslint-disable-next-line no-alert
                alert(`${f.name} terlalu besar (max 5MB). File diabaikan.`);
                console.warn("File skipped due to size:", f.name, f.size);
                continue;
            }
            accepted.push(f);
        }
        if (accepted.length === 0) {
            if (mainInputRef.current) mainInputRef.current.value = "";
            return;
        }
        setData((prev) => {
            const existing = Array.isArray(prev.lampiranUtama)
                ? prev.lampiranUtama
                : [];
            const toAdd = accepted.map((file) => ({
                name: file.name,
                size: file.size,
                type: file.type,
                file,
                kategori: inferCategory(file),
            }));
            const maxRemain = Math.max(0, 5 - existing.length);
            const newList = existing.concat(toAdd.slice(0, maxRemain));
            if (toAdd.length > maxRemain)
                console.warn("Some files were trimmed to respect max 5 utama");
            return { ...prev, lampiranUtama: newList };
        });
        if (mainInputRef.current) mainInputRef.current.value = "";
    };

    // Append additional files, enforce max 3, validate size
    const handleAdditionalFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const arr = Array.from(files);
        const accepted: File[] = [];
        for (const f of arr) {
            if (f.size > 5 * 1024 * 1024) {
                // eslint-disable-next-line no-alert
                alert(`${f.name} terlalu besar (max 5MB). File diabaikan.`);
                console.warn("File skipped due to size:", f.name, f.size);
                continue;
            }
            accepted.push(f);
        }
        if (accepted.length === 0) {
            if (tambahanInputRef.current) tambahanInputRef.current.value = "";
            return;
        }
        setData((prev) => {
            const existing = Array.isArray(prev.lampiranTambahan)
                ? prev.lampiranTambahan
                : [];
            const toAdd = accepted.map((file) => ({
                name: file.name,
                size: file.size,
                type: file.type,
                file,
                kategori: inferCategory(file),
            }));
            const maxRemain = Math.max(0, 3 - existing.length);
            const newList = existing.concat(toAdd.slice(0, maxRemain));
            if (toAdd.length > maxRemain)
                console.warn(
                    "Some files were trimmed to respect max 3 tambahan"
                );
            return { ...prev, lampiranTambahan: newList };
        });
        if (tambahanInputRef.current) tambahanInputRef.current.value = "";
    };

    const handleDelete = (which: "utama" | "tambahan", idx: number) => {
        const confirmMsg = "Yakin ingin menghapus file ini?";
        if (!window.confirm(confirmMsg)) return;
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
        if (!f || !f.file) return;
        const fileObj = f.file as File;
        const url = URL.createObjectURL(fileObj);
        const t = (fileObj.type || fileObj.name).toLowerCase();
        if (t.includes("pdf") || fileObj.name.toLowerCase().endsWith(".pdf"))
            setPreviewType("pdf");
        else setPreviewType("image");
        setPreviewUrl(url);
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
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-gray-800">
                            Lampiran Utama{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-gray-500 -mt-2">
                            Wajib. Unggah minimal 1 dokumen pendukung utama.
                            Format: PDF, JPG, PNG. Maks: 5MB/file.
                        </p>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer group">
                            <div className="bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] group-hover:scale-110 transition-transform">
                                <BsFileEarmarkArrowUp size={24} />
                            </div>
                            <label
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                                onClick={() => mainInputRef.current?.click()}
                            >
                                Seret &amp; lepas atau{" "}
                                <span className="text-[#007bff] font-bold">
                                    pilih file
                                </span>
                            </label>
                            <input
                                ref={mainInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleMainFileChange}
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

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer group">
                            <div className="bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] group-hover:scale-110 transition-transform">
                                <BsFileEarmarkArrowUp size={24} />
                            </div>
                            <label
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                                onClick={() =>
                                    tambahanInputRef.current?.click()
                                }
                            >
                                Seret &amp; lepas atau{" "}
                                <span className="text-[#007bff] font-bold">
                                    pilih file
                                </span>
                            </label>
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

            {/* Card preview: Lampiran Utama */}
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
                                <select
                                    value={selectedUtama}
                                    onChange={(e) =>
                                        setSelectedUtama(e.target.value)
                                    }
                                    className="h-9 text-sm border rounded px-2"
                                >
                                    <option value="Semua">Semua</option>
                                    <option value="File">File (PDF)</option>
                                    <option value="Foto">Foto (JPG/PNG)</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
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
                                                <Button
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            "utama",
                                                            idx
                                                        )
                                                    }
                                                    className="h-9"
                                                >
                                                    Hapus
                                                </Button>
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

            {/* Card preview: Lampiran Tambahan */}
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
                                <select
                                    value={selectedTambahan}
                                    onChange={(e) =>
                                        setSelectedTambahan(e.target.value)
                                    }
                                    className="h-9 text-sm border rounded px-2"
                                >
                                    <option value="Semua">Semua</option>
                                    <option value="File">File (PDF)</option>
                                    <option value="Foto">Foto (JPG/PNG)</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
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
                                                <Button
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            "tambahan",
                                                            idx
                                                        )
                                                    }
                                                    className="h-9"
                                                >
                                                    Hapus
                                                </Button>
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
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg overflow-hidden w-[90%] max-w-3xl">
                        <div className="flex justify-end p-2">
                            <button
                                onClick={handleClosePreview}
                                className="text-sm text-gray-600 px-3 py-1"
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="p-4">
                            {previewType === "pdf" ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-[70vh]"
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
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
