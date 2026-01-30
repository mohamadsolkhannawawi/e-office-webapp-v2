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
        <div className="space-y-6">
            {/* Refresh Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        loadPublishedNumbers();
                        loadNextSuggestion();
                    }}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Year Filter */}
            <div className="bg-white rounded-lg border p-4">
                <Label htmlFor="year-select" className="text-sm font-medium">
                    Tahun
                </Label>
                <select
                    id="year-select"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="mt-2 block w-full sm:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
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

            {/* Next Suggestion Card */}
            {nextSuggestion && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">
                        Nomor Surat Berikutnya
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-blue-700">
                                Terakhir Dipublikasikan
                            </p>
                            <p className="font-mono text-lg font-bold text-blue-900">
                                {nextSuggestion.lastPublished || "Belum ada"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700">
                                Saran Nomor Berikutnya
                            </p>
                            <p className="font-mono text-lg font-bold text-green-600">
                                {nextSuggestion.suggestedNumber}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Published Numbers Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                        Daftar Nomor Surat Tahun {year} (
                        {publishedNumbers.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : publishedNumbers.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                            Belum ada nomor surat yang dipublikasikan
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nomor Surat</TableHead>
                                <TableHead>Nama Aplikasi</TableHead>
                                <TableHead>Tanggal Publish</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {publishedNumbers.map((item, idx) => (
                                <TableRow key={item.applicationId}>
                                    <TableCell className="text-sm text-gray-600">
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell className="font-mono font-semibold text-gray-900">
                                        {item.letterNumber}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {item.namaAplikasi}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {formatDate(item.publishedAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog
                                            open={
                                                editingId === item.applicationId
                                            }
                                            onOpenChange={(open) => {
                                                if (!open) {
                                                    setEditingId(null);
                                                    setEditValue("");
                                                    setValidationResult(null);
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
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-106.25">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Edit Nomor Surat
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Ubah nomor surat untuk
                                                        aplikasi &quot;
                                                        {item.namaAplikasi}
                                                        &quot;
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4">
                                                    {/* Current Number */}
                                                    <div>
                                                        <Label className="text-sm font-medium">
                                                            Nomor Saat Ini
                                                        </Label>
                                                        <Input
                                                            value={
                                                                item.letterNumber
                                                            }
                                                            disabled
                                                            className="mt-2 bg-gray-100"
                                                        />
                                                    </div>

                                                    {/* New Number Input */}
                                                    <div>
                                                        <Label
                                                            htmlFor="new-number"
                                                            className="text-sm font-medium"
                                                        >
                                                            Nomor Baru
                                                        </Label>
                                                        <Input
                                                            id="new-number"
                                                            value={editValue}
                                                            onChange={(e) =>
                                                                handleEditChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="xxx/UN7.F8.1/KM/I/2026"
                                                            className="mt-2 font-mono"
                                                        />
                                                    </div>

                                                    {/* Validation Feedback */}
                                                    {validationResult && (
                                                        <div
                                                            className={`p-3 rounded-md flex items-start gap-2 ${
                                                                validationResult.isAvailable &&
                                                                validationResult.isValidFormat
                                                                    ? "bg-green-50 border border-green-200"
                                                                    : "bg-red-50 border border-red-200"
                                                            }`}
                                                        >
                                                            {validationResult.isAvailable &&
                                                            validationResult.isValidFormat ? (
                                                                <>
                                                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
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
                                                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
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
                                                    <div className="flex justify-end gap-3 pt-4 border-t">
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
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            {isValidating ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Memvalidasi...
                                                                </>
                                                            ) : (
                                                                "Simpan Perubahan"
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
                )}
            </div>
        </div>
    );
}
