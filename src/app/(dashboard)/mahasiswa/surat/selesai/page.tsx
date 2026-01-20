"use client";

import { useEffect, useState } from "react";
import {
    ChevronRight,
    Filter,
    ChevronLeft,
    Loader2,
    Download,
    Eye,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";

export default function SuratSelesaiPage() {
    const [applications, setApplications] = useState<ApplicationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const fetchApplications = async (page = 1) => {
        setIsLoading(true);
        try {
            // Fetch both COMPLETED and REJECTED
            // We'll rely on the backend to handle this if we pass a special status or multiple
            // For now, let's fetch COMPLETED. We might need to fetch REJECTED too.
            // If the API supports multiple, we'd use that.
            // Using "COMPLETED" for now as per the "Selesai" name.
            const { data, meta } = await getApplications({
                status: "FINISHED",
                page,
                limit: 10,
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
    };

    useEffect(() => {
        fetchApplications();
    }, []);

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
                <span>Persuratan</span>
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
            <div className="flex items-center">
                <Button
                    variant="outline"
                    className="bg-white border-gray-200 text-slate-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    Filter Jenis Surat
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
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
                                        colSpan={3}
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
                                        colSpan={3}
                                        className="px-6 py-12 text-center text-slate-400"
                                    >
                                        Belum ada surat yang selesai.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => {
                                    const status = getStatusInfo(app.status);
                                    const StatusIcon = status.icon;

                                    // Extract jenis from values if available, otherwise fallback
                                    const jenis =
                                        app.formData.jenisBeasiswa ||
                                        "internal";

                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 group-hover:text-[#007bff] transition-colors">
                                                        {app.scholarshipName}
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
                                                        href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}/${app.id}`}
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 text-slate-600 hover:text-green-600 hover:bg-green-50"
                                                            title="Download"
                                                            onClick={() =>
                                                                alert(
                                                                    "Fitur download sedang disiapkan",
                                                                )
                                                            }
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
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
