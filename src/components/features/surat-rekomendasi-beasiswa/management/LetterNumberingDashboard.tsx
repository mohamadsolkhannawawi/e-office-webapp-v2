"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
    Loader2,
    Edit2,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Hash,
    Calendar,
} from "lucide-react";

interface PublishedNumber {
    applicationId: string;
    letterNumber: string;
    sequence: string;
    namaAplikasi: string;
    publishedAt: string;
}

interface NextSuggestion {
    lastPublished: string | null;
    lastSequence: string;
    suggestedNumber: string;
    suggestedSequence: string;
}

interface ValidationResult {
    letterNumber?: string;
    isValidFormat: boolean;
    isAvailable: boolean;
    inUse?: boolean;
}

export function LetterNumberingDashboard() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [publishedNumbers, setPublishedNumbers] = useState<PublishedNumber[]>(
        [],
    );
    const [nextSuggestion, setNextSuggestion] = useState<NextSuggestion | null>(
        null,
    );
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [validationResult, setValidationResult] =
        useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // Load published numbers
    const loadPublishedNumbers = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/master/letter-numbering/published?year=${year}`,
            );
            if (response.ok) {
                const json = await response.json();
                // Ekstrak dengan strict dari format konsisten: { success: true, data: {...} }
                const publishedData = json.data as typeof json.data;
                setPublishedNumbers(publishedData?.items ?? []);
            } else {
                toast.error(
                    "Gagal memuat daftar nomor surat. Silakan refresh halaman atau hubungi administrator",
                );
            }
        } catch (error) {
            toast.error(
                "Terjadi kesalahan saat memuat data nomor surat. Periksa koneksi internet Anda",
            );
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Load next suggestion
    const loadNextSuggestion = async () => {
        const month = new Date().getMonth() + 1;
        try {
            const response = await fetch(
                `/api/master/letter-numbering/next-suggestion?year=${year}&month=${month}`,
            );
            if (response.ok) {
                const json = await response.json();
                // Ekstrak dengan strict dari format konsisten: { success: true, data: {...} }
                const nextSuggestionData = json.data as NextSuggestion;
                setNextSuggestion(nextSuggestionData);
            }
        } catch (error) {
            console.error("Error loading suggestion:", error);
        }
    };

    // Validate letter number format
    const validateLetterNumber = async (value: string) => {
        setIsValidating(true);
        try {
            const response = await fetch(
                `/api/master/letter-numbering/validate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ letterNumber: value }),
                },
            );

            if (response.ok) {
                const json = await response.json();
                // Ekstrak dengan strict dari format konsisten: { success: true, data: {...} }
                const validationData = json.data as ValidationResult;
                setValidationResult(validationData);
            } else {
                toast.error("Gagal memvalidasi nomor surat. Silakan coba lagi");
            }
        } catch (error) {
            toast.error(
                "Terjadi kesalahan saat validasi. Periksa koneksi internet Anda",
            );
            console.error(error);
        } finally {
            setIsValidating(false);
        }
    };

    // Handle edit value change with validation
    const handleEditChange = (value: string) => {
        setEditValue(value);
        if (value.length > 5) {
            validateLetterNumber(value);
        }
    };

    // Submit edit
    const handleEditSubmit = async () => {
        if (!editingId || !validationResult?.isAvailable) {
            toast.error(
                "Format nomor surat tidak valid atau nomor sudah digunakan. Silakan gunakan nomor lain",
            );
            return;
        }

        try {
            const response = await fetch(
                `/api/master/letter-numbering/${editingId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newLetterNumber: editValue }),
                },
            );

            if (response.ok) {
                toast.success(
                    "Nomor surat berhasil diubah! Perubahan telah tersimpan",
                );
                setEditingId(null);
                setEditValue("");
                setValidationResult(null);
                loadPublishedNumbers();
                loadNextSuggestion();
            } else if (response.status === 403) {
                toast.error(
                    "Anda tidak memiliki izin untuk mengubah nomor surat. Hubungi administrator",
                );
            } else {
                const error = await response.json();
                toast.error(
                    error.message ||
                        "Gagal mengubah nomor surat. Silakan coba lagi",
                );
            }
        } catch (error) {
            toast.error(
                "Terjadi kesalahan sistem saat mengubah nomor surat. Hubungi administrator",
            );
            console.error(error);
        }
    };

    // Initial load
    useEffect(() => {
        loadPublishedNumbers();
        loadNextSuggestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Controls Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <Label
                            htmlFor="year-select"
                            className="text-sm font-semibold text-slate-600 mb-2 block"
                        >
                            <Calendar className="inline h-4 w-4 mr-2" />
                            Tahun
                        </Label>
                        <select
                            id="year-select"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="rounded-3xl border border-slate-100 px-3 py-2 text-sm bg-slate-50/50 text-slate-700 focus:ring-2 focus:ring-undip-blue focus:border-transparent transition-all"
                        >
                            {Array.from(
                                { length: 5 },
                                (_, i) => new Date().getFullYear() - i,
                            ).map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        onClick={() => {
                            loadPublishedNumbers();
                            loadNextSuggestion();
                        }}
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10 rounded-3xl"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </Card>

            {/* Next Suggestion Card */}
            {nextSuggestion && (
                <Card className="border-none shadow-sm overflow-hidden bg-linear-to-br from-undip-blue/5 to-blue-50 border border-undip-blue/10 rounded-3xl">
                    <div className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                            <Hash className="h-5 w-5 text-undip-blue" />
                            Nomor Surat Berikutnya
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white/60 rounded-3xl p-4 border border-undip-blue/20">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Terakhir Dipublikasikan
                                </p>
                                <p className="font-mono text-xl font-bold text-slate-900">
                                    {nextSuggestion.lastPublished || "—"}
                                </p>
                            </div>
                            <div className="bg-white/60 rounded-3xl p-4 border border-green-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Saran Nomor Berikutnya
                                </p>
                                <p className="font-mono text-xl font-bold text-green-600">
                                    {nextSuggestion.suggestedNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Published Numbers Table */}
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl gap-0">
                <div className="px-6 pb-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">
                            Daftar Nomor Surat Tahun {year}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Total: {publishedNumbers.length} nomor
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-undip-blue border-b border-slate-100 text-[11px] uppercase text-white font-bold tracking-wider">
                                <th className="px-6 py-4 w-12">No</th>
                                <th className="px-6 py-4">Nomor Surat</th>
                                <th className="px-6 py-4">Nama Aplikasi</th>
                                <th className="px-6 py-4">Tanggal Publish</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="text-slate-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-16 w-16 mx-auto mb-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-slate-600 font-medium">
                                                Memuat data...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : publishedNumbers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="text-slate-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-16 w-16 mx-auto mb-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-slate-600 font-medium">
                                                Belum ada nomor surat yang
                                                dipublikasikan
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                Belum ada data surat yang
                                                tersedia saat ini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                publishedNumbers.map((item, idx) => (
                                    <tr
                                        key={item.applicationId}
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-slate-500">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                            {item.letterNumber}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {item.namaAplikasi}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {formatDate(item.publishedAt)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Dialog
                                                open={
                                                    editingId ===
                                                    item.applicationId
                                                }
                                                onOpenChange={(open) => {
                                                    if (!open) {
                                                        setEditingId(null);
                                                        setEditValue("");
                                                        setValidationResult(
                                                            null,
                                                        );
                                                    } else {
                                                        setEditingId(
                                                            item.applicationId,
                                                        );
                                                        setEditValue(
                                                            item.letterNumber,
                                                        );
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 text-slate-600 hover:text-undip-blue hover:bg-blue-50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md rounded-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-lg">
                                                            Edit Nomor Surat
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Ubah nomor surat
                                                            untuk aplikasi
                                                            &quot;
                                                            {item.namaAplikasi}
                                                            &quot;
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-4 py-4">
                                                        {/* Current Number */}
                                                        <div>
                                                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                                                Nomor Saat Ini
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    item.letterNumber
                                                                }
                                                                disabled
                                                                className="bg-slate-50 border-slate-100 text-slate-600 rounded-3xl"
                                                            />
                                                        </div>

                                                        {/* New Number Input */}
                                                        <div>
                                                            <Label
                                                                htmlFor="new-number"
                                                                className="text-sm font-medium text-slate-700 mb-2 block"
                                                            >
                                                                Nomor Baru
                                                            </Label>
                                                            <Input
                                                                id="new-number"
                                                                value={
                                                                    editValue
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setEditValue(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    validateLetterNumber(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                                placeholder={`Contoh: 001/UN7.F8.1/KM/I/${new Date().getFullYear()}`}
                                                                className="h-10 border-slate-100 focus:ring-undip-blue focus:border-undip-blue rounded-3xl"
                                                            />
                                                        </div>

                                                        {/* Validation Result */}
                                                        {validationResult && (
                                                            <div
                                                                className={`flex gap-3 p-3 rounded-3xl ${
                                                                    validationResult.isAvailable &&
                                                                    validationResult.isValidFormat
                                                                        ? "bg-green-50 border border-green-200"
                                                                        : "bg-red-50 border border-red-200"
                                                                }`}
                                                            >
                                                                {validationResult.isAvailable &&
                                                                validationResult.isValidFormat ? (
                                                                    <>
                                                                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-green-900">
                                                                                Nomor
                                                                                Valid
                                                                            </p>
                                                                            <p className="text-xs text-green-700">
                                                                                Nomor
                                                                                surat
                                                                                ini
                                                                                tersedia
                                                                                dan
                                                                                bisa
                                                                                digunakan
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-red-900">
                                                                                {!validationResult.isValidFormat
                                                                                    ? "Format tidak valid"
                                                                                    : "Nomor sudah digunakan"}
                                                                            </p>
                                                                            {!validationResult.isValidFormat && (
                                                                                <p className="text-xs text-red-700">
                                                                                    Format:
                                                                                    xxx/UN7.F8.1/KM/I/2026
                                                                                </p>
                                                                            )}
                                                                            {validationResult.inUse && (
                                                                                <p className="text-xs text-red-700">
                                                                                    Digunakan
                                                                                    oleh:{" "}
                                                                                    {
                                                                                        validationResult.inUse
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingId(
                                                                        null,
                                                                    );
                                                                    setEditValue(
                                                                        "",
                                                                    );
                                                                    setValidationResult(
                                                                        null,
                                                                    );
                                                                }}
                                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 rounded-3xl"
                                                            >
                                                                Batal
                                                            </Button>
                                                            <Button
                                                                onClick={
                                                                    handleEditSubmit
                                                                }
                                                                disabled={
                                                                    isValidating ||
                                                                    !validationResult?.isAvailable ||
                                                                    !validationResult?.isValidFormat ||
                                                                    editValue ===
                                                                        item.letterNumber
                                                                }
                                                                className="bg-undip-blue hover:bg-sky-700 text-white h-9 rounded-3xl"
                                                            >
                                                                {isValidating ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Validasi...
                                                                    </>
                                                                ) : (
                                                                    "Simpan"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
