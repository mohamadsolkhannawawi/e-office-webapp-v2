"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronRight,
    FileSpreadsheet,
    FileText,
    Search,
    Calendar,
    Filter,
    Archive,
    Eye,
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
                limit: 20,
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
            nomorSurat:
                (app as unknown as { letterNumber?: string }).letterNumber ||
                "-",
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
        <div className="space-y-6 animate-in fade-in duration-500">
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

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-undip-blue/10 rounded-xl">
                        <Archive className="h-6 w-6 text-undip-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Arsip Surat
                        </h1>
                        <p className="text-sm text-slate-500">
                            Total {totalItems} surat tersimpan
                        </p>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={exportToExcel}
                        variant="outline"
                        className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button
                        onClick={exportToPDF}
                        variant="outline"
                        className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                    >
                        <FileText className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600">
                        Filter
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama/NIM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filter Beasiswa */}
                    <Select
                        value={filterBeasiswa}
                        onValueChange={setFilterBeasiswa}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Jenis Beasiswa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Beasiswa</SelectItem>
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
                            className="pl-10"
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
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-12">No</TableHead>
                            <TableHead>Nama Pengaju</TableHead>
                            <TableHead>NIM</TableHead>
                            <TableHead>Beasiswa</TableHead>
                            <TableHead>Nomor Surat</TableHead>
                            <TableHead>Tanggal Terbit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-8 text-slate-400"
                                >
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-8 text-slate-400"
                                >
                                    Tidak ada data arsip
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app, index) => (
                                <TableRow
                                    key={app.id}
                                    className="hover:bg-slate-50"
                                >
                                    <TableCell className="font-medium">
                                        {(currentPage - 1) * 20 + index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {app.formData?.namaLengkap ||
                                            app.applicantName ||
                                            "-"}
                                    </TableCell>
                                    <TableCell>
                                        {app.formData?.nim || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {app.scholarshipName ||
                                            app.letterType?.name ||
                                            "-"}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {(
                                            app as unknown as {
                                                letterNumber?: string;
                                            }
                                        ).letterNumber || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            app.updatedAt,
                                        ).toLocaleDateString("id-ID")}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                            Terbit
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/upa/surat/surat-rekomendasi-beasiswa/detail/${app.id}`}
                                            className="p-2 hover:bg-slate-100 rounded-lg inline-flex"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="h-4 w-4 text-slate-500" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Halaman {currentPage} dari {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
