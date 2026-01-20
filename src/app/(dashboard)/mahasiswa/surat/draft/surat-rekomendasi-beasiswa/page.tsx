"use client";

import { useEffect, useState, useCallback } from "react";
import {
    ChevronRight,
    Filter,
    ChevronLeft,
    Loader2,
    Trash2,
    Play,
    FileText,
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

export default function SuratDraftPage() {
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
                    status: "DRAFT",
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
                <Link
                    href="/mahasiswa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Draf Surat
                </Link>
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
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari draft..."
                        className="pl-9 bg-white border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={jenisFilter} onValueChange={setJenisFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 text-slate-700">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Filter Draft" />
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
                                <th className="px-6 py-4 font-bold text-slate-700 w-12 text-center">
                                    No
                                </th>
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
                                        Tidak ada draft yang tersimpan.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app, index) => {
                                    const jenis =
                                        app.formData.jenisBeasiswa ||
                                        "internal";

                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-center text-slate-500 font-medium">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>
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
