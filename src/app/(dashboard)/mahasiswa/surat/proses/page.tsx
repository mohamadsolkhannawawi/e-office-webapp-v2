"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    Filter,
    ChevronLeft,
    Loader2,
    Search,
} from "lucide-react";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SuratDalamProsesPage() {
    const [applications, setApplications] = useState<ApplicationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [jenisFilter, setJenisFilter] = useState<string>("ALL");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const fetchApplications = useCallback(
        async (page = 1, search = searchTerm, jenis = jenisFilter) => {
            setIsLoading(true);
            try {
                const { data, meta } = await getApplications({
                    status: "IN_PROGRESS",
                    page,
                    limit: 10,
                    search: search || undefined,
                    jenisBeasiswa: jenis === "ALL" ? undefined : jenis,
                });
                // Filter out REJECTED status - they should appear in "Selesai" page instead
                const filteredData = data.filter(
                    (app) => app.status !== "REJECTED",
                );
                setApplications(filteredData);
                setPagination({
                    page: meta.page,
                    limit: meta.limit,
                    total: meta.total,
                    totalPages: meta.totalPages,
                });
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [searchTerm, jenisFilter],
    );

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchApplications(1, searchTerm, jenisFilter);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, jenisFilter, fetchApplications]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchApplications(newPage);
        }
    };

    const getStatusInfo = (app: ApplicationSummary) => {
        const roles = {
            1: "Supervisor Akademik",
            2: "Manajer TU",
            3: "Wakil Dekan 1",
            4: "UPA",
        };
        const getRoleName = (step: number) =>
            roles[step as keyof typeof roles] || "Petugas";

        if (app.status === "REJECTED") {
            return {
                label: `Ditolak oleh ${getRoleName(app.currentStep)}`,
                color: "text-red-600 bg-red-50",
            };
        }
        if (app.status === "REVISION") {
            // Use lastRevisionFromRole if available, otherwise fall back to currentStep logic
            const revisionFromRole =
                app.lastRevisionFromRole || getRoleName(app.currentStep + 1);
            return {
                label: `Revisi dari ${revisionFromRole}`,
                color: "text-orange-600 bg-orange-50",
            };
        }
        if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
            return {
                label: `Menunggu Verifikasi ${getRoleName(app.currentStep)}`,
                color: "text-blue-600 bg-blue-50",
            };
        }
        if (app.status === "COMPLETED") {
            return {
                label: "Selesai",
                color: "text-green-600 bg-green-50",
            };
        }

        return { label: app.status, color: "text-slate-600 bg-slate-50" };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href="/mahasiswa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Persuratan
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Surat Dalam Proses</span>
            </nav>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-slate-800">
                Surat Dalam Proses
            </h1>
            <p className="text-sm text-slate-500 -mt-4">
                Daftar surat rekomendasi beasiswa yang sedang dalam proses
            </p>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari surat..."
                        className="pl-9 bg-white border-gray-200 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={jenisFilter} onValueChange={setJenisFilter}>
                    <SelectTrigger className="w-full sm:w-1/2 bg-white border-gray-200 text-slate-700">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Filter Jenis Surat" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Jenis</SelectItem>
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
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 w-12">
                                    No
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 w-1/2">
                                    Subjek Surat
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 w-1/4">
                                    Status Surat
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 w-1/4 text-right">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        Tidak ada surat yang sedang diproses.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app, index) => {
                                    const statusInfo = getStatusInfo(app);
                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 font-medium">
                                                {app.scholarshipName ||
                                                    app.letterType?.name ||
                                                    "Surat Rekomendasi Beasiswa"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`font-bold ${statusInfo.color}`}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={
                                                            app.status ===
                                                            "REVISION"
                                                                ? `/mahasiswa/surat/proses/detail/${app.id}`
                                                                : `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}`
                                                        }
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-gray-200 text-slate-600 hover:bg-gray-50 text-xs px-4 h-8"
                                                        >
                                                            Detail
                                                        </Button>
                                                    </Link>
                                                    {/* Show distinct action for revisions if we can detect them */}
                                                    {/* Current logic doesn't explicitly separate revision rows yet without different status filter */}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!isLoading && applications.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-1 gap-4">
                    <span>
                        Menampilkan{" "}
                        {(pagination.page - 1) * pagination.limit + 1} sampai{" "}
                        {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total,
                        )}{" "}
                        dari {pagination.total} entri
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                handlePageChange(pagination.page - 1)
                            }
                            className="text-xs h-8 px-2"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            className="bg-undip-blue hover:bg-sky-700 text-xs h-8 w-8 p-0"
                        >
                            {pagination.page}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() =>
                                handlePageChange(pagination.page + 1)
                            }
                            className="text-xs h-8 px-2"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
