"use client";

import { useEffect, useState } from "react";
import {
    ChevronRight,
    Filter,
    ChevronLeft,
    Loader2,
    Trash2,
    Play,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";

export default function SuratDraftPage() {
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
            const { data, meta } = await getApplications({
                status: "DRAFT",
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

    const handleDeleteDraft = async (id: string) => {
        const confirm = window.confirm(
            "Apakah Anda yakin ingin menghapus draft ini?",
        );
        if (!confirm) return;

        try {
            // Simplified delete call, assuming standard API
            const res = await fetch(
                `/api/surat-rekomendasi/applications/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );
            if (res.ok) {
                fetchApplications(pagination.page);
            } else {
                alert("Gagal menghapus draft.");
            }
        } catch (error) {
            console.error("Delete draft error:", error);
            alert("Terjadi kesalahan saat menghapus draft.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span>Draf Surat</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">
                    Surat Rekomendasi Beasiswa
                </span>
            </nav>

            {/* Page Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 transition-all duration-200">
                <h1 className="text-xl font-bold text-slate-800">
                    Draft Surat Rekomendasi Beasiswa
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Lanjutkan pengajuan surat yang telah Anda simpan sebelumnya.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center">
                <Button
                    variant="outline"
                    className="bg-white border-gray-200 text-slate-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    Filter Draft
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
                                    Terakhir Diubah
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
                                        Tidak ada draft yang tersimpan.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => {
                                    const jenis =
                                        app.formData.jenisBeasiswa ||
                                        "internal";

                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 group-hover:text-[#007bff] transition-colors">
                                                            {
                                                                app.scholarshipName
                                                            }
                                                        </span>
                                                        <span className="text-xs text-slate-500 mt-0.5">
                                                            Beasiswa{" "}
                                                            {jenis ||
                                                                "internal"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {app.updatedAt &&
                                                !isNaN(
                                                    new Date(
                                                        app.updatedAt,
                                                    ).getTime(),
                                                )
                                                    ? new Date(
                                                          app.updatedAt,
                                                      ).toLocaleDateString(
                                                          "id-ID",
                                                          {
                                                              day: "numeric",
                                                              month: "long",
                                                              year: "numeric",
                                                          },
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}?id=${app.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 text-[#007bff] hover:bg-blue-50 font-medium px-4"
                                                        >
                                                            <Play className="h-4 w-4 fill-current" />
                                                            Lanjutkan
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        title="Hapus Draft"
                                                        onClick={() =>
                                                            handleDeleteDraft(
                                                                app.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
                            dari {pagination.total} draft
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
