"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronRight,
    ChevronLeft,
    FileSpreadsheet,
    FileText,
    Search,
    Calendar,
    Filter,
    Archive,
    Eye,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";

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
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchArchiveData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getApplications({
                status: "COMPLETED",
                page: currentPage,
                limit: 10,
                search: searchTerm,
                jenisBeasiswa:
                    filterBeasiswa !== "all" ? filterBeasiswa : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sortOrder: "desc",
            });
            setApplications(result.data);
            setTotalPages(result.meta.totalPages);
            setTotalItems(result.meta.total);
        } catch (error) {
            console.error("Error fetching archive:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterBeasiswa, startDate, endDate]);

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
    };

    // Export to PDF (simple print-based approach)
    const exportToPDF = () => {
        const data = prepareExportData();
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

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
                    Total: ${totalItems} surat
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href="/upa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Dashboard
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Arsip Surat</span>
            </nav>

            {/* Header with Title and Export Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Arsip Surat
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Total {totalItems} surat tersimpan
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

            {/* Filters Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="p-6 border-b border-slate-50 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">
                            Filter
                        </span>
                    </div>
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
                                <SelectItem value="BidikmisiKIP">
                                    Bidikmisi/KIP
                                </SelectItem>
                                <SelectItem value="PPA">PPA</SelectItem>
                                <SelectItem value="Unggulan">
                                    Beasiswa Unggulan
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Start Date */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                placeholder="Dari tanggal"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-10 h-10 border-slate-100 bg-slate-50/50"
                            />
                        </div>

                        {/* End Date */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                placeholder="Sampai tanggal"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10 h-10 border-slate-100 bg-slate-50/50"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-undip-blue border-b border-slate-50 text-[11px] uppercase text-white font-bold tracking-wider">
                                    <th className="px-6 py-4 w-12">No</th>
                                    <th className="px-6 py-4">Nama Pengaju</th>
                                    <th className="px-6 py-4">NIM</th>
                                    <th className="px-6 py-4">Beasiswa</th>
                                    <th className="px-6 py-4">Nomor Surat</th>
                                    <th className="px-6 py-4">
                                        Tanggal Terbit
                                    </th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-8 text-center text-slate-400"
                                        >
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : applications.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-8 text-center text-slate-400"
                                        >
                                            Tidak ada data arsip
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app, index) => (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-slate-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-slate-500">
                                                {(currentPage - 1) * 10 +
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
                                                <Link
                                                    href={`/upa/surat/surat-rekomendasi-beasiswa/detail/${app.id}`}
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
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-bold text-slate-400">
                            Menampilkan{" "}
                            <span className="text-slate-600">
                                {(currentPage - 1) * 10 + 1}-
                                {Math.min(currentPage * 10, totalItems)}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-600">{totalItems}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400"
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                    let pageNum = currentPage - 2 + i;
                                    if (currentPage <= 2) pageNum = i + 1;
                                    if (currentPage >= totalPages - 1)
                                        pageNum = totalPages - 4 + i;

                                    if (pageNum < 1 || pageNum > totalPages)
                                        return null;

                                    return (
                                        <Button
                                            key={pageNum}
                                            className={`h-8 w-8 text-xs font-bold ${currentPage === pageNum ? "bg-undip-blue hover:bg-sky-700" : "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none border-none"}`}
                                            onClick={() =>
                                                setCurrentPage(pageNum)
                                            }
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                },
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
