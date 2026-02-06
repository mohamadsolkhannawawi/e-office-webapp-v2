"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileSpreadsheet,
    FileText,
    Search,
    Filter,
    Eye,
    CheckCircle,
    Download,
    Loader2,
    X,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import {
    generateAndDownloadDocument,
    getTemplateIdByLetterType,
} from "@/lib/template-api";
import { Label } from "@/components/ui/label";
import { StandardPagination } from "@/components/ui/standard-pagination";

// Type untuk export
interface ExportData {
    no: number;
    nama: string;
    nim: string;
    beasiswa: string;
    nomorSurat: string;
    tanggalTerbit: string;
    status: string;
}

export default function ArsipPage() {
    const [applications, setApplications] = useState<ApplicationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBeasiswa, setFilterBeasiswa] = useState("all");
    const [startDateInput, setStartDateInput] = useState("");
    const [endDateInput, setEndDateInput] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchArchiveData = useCallback(async () => {
        setLoading(true);
        try {
            // Convert date inputs to ISO format with proper times
            let startDateIso: string | undefined = undefined;
            let endDateIso: string | undefined = undefined;

            if (startDateInput) {
                const start = new Date(startDateInput);
                start.setHours(0, 0, 0, 0);
                startDateIso = start.toISOString();
            }

            if (endDateInput) {
                const end = new Date(endDateInput);
                end.setHours(23, 59, 59, 999);
                endDateIso = end.toISOString();
            }

            const result = await getApplications({
                status: "COMPLETED",
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                jenisBeasiswa:
                    filterBeasiswa !== "all" ? filterBeasiswa : undefined,
                startDate: startDateIso,
                endDate: endDateIso,
                sortOrder: sortOrder,
            });
            setApplications(result.data);
            setPagination({
                page: result.meta.page,
                limit: result.meta.limit,
                total: result.meta.total,
                totalPages: result.meta.totalPages,
            });
        } catch (error) {
            console.error("Error fetching archive:", error);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.page,
        pagination.limit,
        searchTerm,
        filterBeasiswa,
        startDateInput,
        endDateInput,
        sortOrder,
    ]);

    const handleDownloadPDF = async (applicationId: string) => {
        try {
            const link = document.createElement("a");
            link.href = `/api/templates/letter/${applicationId}/pdf`;
            link.download = `Surat-Rekomendasi-${applicationId}.pdf`;
            link.click();
            toast.success("PDF berhasil diunduh!");
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error(
                `Gagal mengunduh PDF: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
            );
        }
    };

    const handleDownloadDOCX = async (applicationId: string) => {
        setDownloadingId(applicationId);
        try {
            const templateId = await getTemplateIdByLetterType(
                "Surat Rekomendasi Beasiswa",
            );
            if (templateId) {
                await generateAndDownloadDocument(
                    templateId,
                    applicationId,
                    `Surat-Rekomendasi-${applicationId}.docx`,
                );
                toast.success("Dokumen Word berhasil diunduh!");
            } else {
                toast.error("Template tidak ditemukan");
            }
        } catch (error) {
            console.error("Error downloading DOCX:", error);
            toast.error(
                `Gagal mengunduh dokumen: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
            );
        } finally {
            setDownloadingId(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPagination((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
    };

    useEffect(() => {
        fetchArchiveData();
    }, [fetchArchiveData]);

    // Prepare data for export
    const prepareExportData = (): ExportData[] => {
        return applications.map((app, index) => ({
            no: index + 1,
            nama: app.formData?.namaLengkap || app.applicantName || "-",
            nim: app.formData?.nim || "-",
            beasiswa: app.scholarshipName || app.letterType?.name || "-",
            nomorSurat: app.letterNumber || "-",
            tanggalTerbit: new Date(app.updatedAt).toLocaleDateString("id-ID"),
            status: app.status === "COMPLETED" ? "Terbit" : app.status,
        }));
    };

    // Export to Excel (CSV format for simplicity)
    const exportToExcel = () => {
        try {
            const data = prepareExportData();
            const headers = [
                "No",
                "Nama",
                "NIM",
                "Beasiswa",
                "Nomor Surat",
                "Tanggal Terbit",
                "Status",
            ];
            const rows = data.map((d) => [
                d.no,
                d.nama,
                d.nim,
                d.beasiswa,
                d.nomorSurat,
                d.tanggalTerbit,
                d.status,
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
            ].join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `arsip-surat-${new Date().toISOString().split("T")[0]}.csv`,
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Excel berhasil diunduh!");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error(
                `Gagal export Excel: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
            );
        }
    };

    // Export to PDF (simple print-based approach)
    const exportToPDF = () => {
        try {
            const data = prepareExportData();
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                toast.error(
                    "Gagal membuka jendela cetak. Pastikan popup tidak diblokir.",
                );
                return;
            }

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Arsip Surat - FSM UNDIP</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #1e3a5f; }
                    h2 { text-align: center; color: #666; font-size: 14px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #1e3a5f; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
                </style>
            </head>
            <body>
                <h1>ARSIP SURAT REKOMENDASI BEASISWA</h1>
                <h2>Fakultas Sains dan Matematika - Universitas Diponegoro</h2>
                <p>Dicetak pada: ${new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}</p>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>NIM</th>
                            <th>Beasiswa</th>
                            <th>Nomor Surat</th>
                            <th>Tanggal Terbit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data
                            .map(
                                (d) => `
                            <tr>
                                <td>${d.no}</td>
                                <td>${d.nama}</td>
                                <td>${d.nim}</td>
                                <td>${d.beasiswa}</td>
                                <td>${d.nomorSurat}</td>
                                <td>${d.tanggalTerbit}</td>
                                <td>${d.status}</td>
                            </tr>
                        `,
                            )
                            .join("")}
                    </tbody>
                </table>
                <div class="footer">
                    Total: ${pagination.total} surat
                </div>
            </body>
            </html>
        `;

            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
            toast.success("Jendela cetak PDF berhasil dibuka!");
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            toast.error(
                `Gagal export PDF: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
            );
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Title and Export Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Arsip Surat
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Total {pagination.total} arsip surat
                    </p>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={exportToExcel}
                        variant="outline"
                        className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button
                        onClick={exportToPDF}
                        variant="outline"
                        className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <FileText className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Filters and Table Card */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden bg-white rounded-3xl py-0 gap-0">
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-50">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari nama/NIM..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 border-slate-100 bg-slate-50/50 w-full"
                            />
                        </div>

                        {/* Filter Beasiswa */}
                        <Select
                            value={filterBeasiswa}
                            onValueChange={setFilterBeasiswa}
                        >
                            <SelectTrigger className="w-full sm:w-50 h-10 border-slate-100 text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Jenis Beasiswa" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Beasiswa
                                </SelectItem>
                                <SelectItem value="internal">
                                    Beasiswa Internal
                                </SelectItem>
                                <SelectItem value="external">
                                    Beasiswa Eksternal
                                </SelectItem>
                                <SelectItem value="akademik">
                                    Beasiswa Akademik
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Range Filter - Stylish Design */}
                        <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                            <Calendar className="h-4 w-4 text-slate-400 ml-1" />

                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor="startDate"
                                    className="text-xs font-medium text-slate-600 whitespace-nowrap"
                                >
                                    Dari
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="startDate"
                                        type="date"
                                        className="h-9 w-35 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        value={startDateInput}
                                        onChange={(e) =>
                                            setStartDateInput(e.target.value)
                                        }
                                        max={endDateInput || undefined}
                                    />
                                </div>
                            </div>

                            <div className="h-4 w-px bg-slate-200" />

                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor="endDate"
                                    className="text-xs font-medium text-slate-600 whitespace-nowrap"
                                >
                                    Sampai
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="endDate"
                                        type="date"
                                        className="h-9 w-35 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        value={endDateInput}
                                        onChange={(e) =>
                                            setEndDateInput(e.target.value)
                                        }
                                        min={startDateInput || undefined}
                                    />
                                </div>
                            </div>

                            {(startDateInput || endDateInput) && (
                                <>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => {
                                            setStartDateInput("");
                                            setEndDateInput("");
                                        }}
                                        title="Hapus filter tanggal"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Sort Order */}
                        <Select
                            value={sortOrder}
                            onValueChange={(value: "asc" | "desc") =>
                                setSortOrder(value)
                            }
                        >
                            <SelectTrigger className="w-full sm:w-40 h-10 border-slate-100 text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Urutkan" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Terbaru</SelectItem>
                                <SelectItem value="asc">Terlama</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-undip-blue border-b border-slate-100 text-[11px] uppercase text-white font-bold tracking-wider">
                                <th className="px-6 py-4 w-12">No</th>
                                <th className="px-6 py-4">Nama Pengaju</th>
                                <th className="px-6 py-4">NIM</th>
                                <th className="px-6 py-4">Beasiswa</th>
                                <th className="px-6 py-4">Nomor Surat</th>
                                <th className="px-6 py-4">Tanggal Terbit</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={8}
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
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
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
                                                Tidak ada data arsip.
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                Belum ada surat yang tersedia
                                                saat ini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app, index) => (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-slate-500">
                                            {(pagination.page - 1) *
                                                pagination.limit +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {app.formData?.namaLengkap ||
                                                app.applicantName ||
                                                "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {app.formData?.nim || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {app.scholarshipName ||
                                                app.letterType?.name ||
                                                "-"}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                            {app.letterNumber || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {new Date(
                                                app.updatedAt,
                                            ).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[11px] font-bold uppercase text-emerald-500">
                                                    Terbit
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={`/upa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=arsip`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-full h-8 text-xs bg-undip-blue font-bold border-slate-100 text-white hover:bg-white hover:border-undip-blue hover:text-undip-blue transition-all gap-1.5 px-4"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detail
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onClick={() =>
                                                        handleDownloadPDF(
                                                            app.id,
                                                        )
                                                    }
                                                    size="sm"
                                                    className="rounded-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 font-bold border-slate-100 text-white transition-all gap-1.5 px-4"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    PDF
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleDownloadDOCX(
                                                            app.id,
                                                        )
                                                    }
                                                    size="sm"
                                                    disabled={
                                                        downloadingId === app.id
                                                    }
                                                    className="rounded-full h-8 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 font-bold border-slate-100 text-white transition-all gap-1.5 px-4"
                                                >
                                                    {downloadingId ===
                                                    app.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Download className="h-3.5 w-3.5" />
                                                    )}
                                                    Word
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Standard Pagination */}
                <StandardPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.limit}
                    totalItems={pagination.total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    itemLabel="surat"
                />
            </Card>
        </div>
    );
}
