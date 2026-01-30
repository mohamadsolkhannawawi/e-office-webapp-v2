"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
                toast.error("Gagal memuat daftar nomor surat");
            }
        } catch (error) {
            toast.error("Error loading published numbers");
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
                toast.error("Error validating letter number");
            }
        } catch (error) {
            toast.error("Validation error");
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
            toast.error("Format tidak valid atau nomor sudah digunakan");
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
                toast.success("Nomor surat berhasil diubah");
                setEditingId(null);
                setEditValue("");
                setValidationResult(null);
                loadPublishedNumbers();
                loadNextSuggestion();
            } else if (response.status === 403) {
                toast.error(
                    "Anda tidak memiliki izin untuk mengubah nomor surat",
                );
            } else {
                const error = await response.json();
                toast.error(error.message || "Gagal mengubah nomor surat");
            }
        } catch (error) {
            toast.error("Error saat mengubah nomor surat");
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
            <Card className="border-none shadow-sm overflow-hidden bg-white">
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
                            className="rounded-lg border border-slate-100 px-3 py-2 text-sm bg-slate-50/50 text-slate-700 focus:ring-2 focus:ring-undip-blue focus:border-transparent transition-all"
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
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 h-10"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </Card>

            {/* Next Suggestion Card */}
            {nextSuggestion && (
                <Card className="border-none shadow-sm overflow-hidden bg-linear-to-br from-undip-blue/5 to-blue-50 border border-undip-blue/10">
                    <div className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                            <Hash className="h-5 w-5 text-undip-blue" />
                            Nomor Surat Berikutnya
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white/60 rounded-lg p-4 border border-undip-blue/20">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Terakhir Dipublikasikan
                                </p>
                                <p className="font-mono text-xl font-bold text-slate-900">
                                    {nextSuggestion.lastPublished || "—"}
                                </p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
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
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">
                            Daftar Nomor Surat Tahun {year}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Total: {publishedNumbers.length} nomor
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    </div>
                ) : publishedNumbers.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">
                            Belum ada nomor surat yang dipublikasikan
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                                    <TableHead className="w-12 font-semibold text-slate-700">
                                        No
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-50">
                                        Nomor Surat
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-50">
                                        Nama Aplikasi
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 min-w-40">
                                        Tanggal Publish
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700 w-20">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100">
                                {publishedNumbers.map((item, idx) => (
                                    <TableRow
                                        key={item.applicationId}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <TableCell className="text-sm text-slate-500 font-medium">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="font-mono font-semibold text-slate-800 text-sm">
                                            {item.letterNumber}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-700">
                                            {item.namaAplikasi}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {formatDate(item.publishedAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
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
                                                <DialogContent className="sm:max-w-md">
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
                                                                className="bg-slate-50 border-slate-100 text-slate-600"
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
                                                                className="h-10 border-slate-100 focus:ring-undip-blue focus:border-undip-blue"
                                                            />
                                                        </div>

                                                        {/* Validation Result */}
                                                        {validationResult && (
                                                            <div
                                                                className={`flex gap-3 p-3 rounded-lg ${
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
                                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9"
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
                                                                className="bg-undip-blue hover:bg-sky-700 text-white h-9"
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
}
