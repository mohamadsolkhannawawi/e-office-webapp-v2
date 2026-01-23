"use client";

import { useEffect, useState, useCallback } from "react";
import {
    ChevronRight,
    Filter,
    ChevronLeft,
    Loader2,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SuratSelesaiPage() {
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
                // Fetch both COMPLETED and REJECTED
                // We'll rely on the backend to handle this if we pass a special status or multiple
                const { data, meta } = await getApplications({
                    status: "FINISHED",
                    page,
                    limit: 10,
                    search: search || undefined,
                    jenisBeasiswa: jenis === "ALL" ? undefined : jenis,
                });
                setApplications(data);
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

    const getStatusInfo = (status: string) => {
        if (status === "COMPLETED") {
            return {
                label: "Diterima",
                color: "text-green-600 bg-green-50",
                icon: CheckCircle,
            };
        }
        if (status === "REJECTED") {
            return {
                label: "Ditolak",
                color: "text-red-600 bg-red-50",
                icon: XCircle,
            };
        }
        return {
            label: status,
            color: "text-slate-600 bg-slate-50",
            icon: CheckCircle,
        };
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
                <span className="text-slate-800">Surat Selesai</span>
            </nav>

            {/* Page Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 transition-all duration-200">
                <h1 className="text-xl font-bold text-slate-800">
                    Surat Selesai
                </h1>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari surat selesai..."
                        className="pl-9 bg-white border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={jenisFilter} onValueChange={setJenisFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 text-slate-700">
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
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        Belum ada surat yang selesai.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app, index) => {
                                    const status = getStatusInfo(app.status);
                                    const StatusIcon = status.icon;

                                    // Extract jenis from values if available, otherwise fallback
                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 group-hover:text-[#007bff] transition-colors">
                                                        {app.scholarshipName ||
                                                            app.letterType
                                                                ?.name ||
                                                            "Surat Rekomendasi Beasiswa"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 mt-1">
                                                        Diajukan pada:{" "}
                                                        {new Date(
                                                            app.createdAt,
                                                        ).toLocaleDateString(
                                                            "id-ID",
                                                            {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}
                                                >
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 text-slate-600 hover:text-[#007bff] hover:bg-blue-50"
                                                            title="Detail"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    {app.status ===
                                                        "COMPLETED" && (
                                                        <Link
                                                            href={`/mahasiswa/surat/proses/preview/${app.id}?stage=mahasiswa&autoPrint=true`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 w-9 p-0 text-slate-600 hover:text-green-600 hover:bg-green-50"
                                                                title="Download"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500 italic">
                            Menampilkan{" "}
                            {(pagination.page - 1) * pagination.limit + 1} -{" "}
                            {Math.min(
                                pagination.page * pagination.limit,
                                pagination.total,
                            )}{" "}
                            dari {pagination.total} surat
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    handlePageChange(pagination.page - 1)
                                }
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                {[...Array(pagination.totalPages)].map(
                                    (_, i) => (
                                        <Button
                                            key={i}
                                            variant={
                                                pagination.page === i + 1
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className={`h-8 w-8 p-0 ${pagination.page === i + 1 ? "bg-[#007bff] hover:bg-blue-600" : ""}`}
                                            onClick={() =>
                                                handlePageChange(i + 1)
                                            }
                                        >
                                            {i + 1}
                                        </Button>
                                    ),
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    handlePageChange(pagination.page + 1)
                                }
                                disabled={
                                    pagination.page === pagination.totalPages
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
