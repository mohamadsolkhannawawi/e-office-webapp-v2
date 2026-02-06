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
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import { Card } from "@/components/ui/card";
import { InlineLoader, ButtonLoader } from "@/components/ui/loader";
import { usePageLoading, useCustomLoading } from "@/contexts/LoadingContext";
import { StandardPagination } from "@/components/ui/standard-pagination";
import toast from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SuratDraftPage() {
    const [applications, setApplications] = useState<ApplicationSummary[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const { isPageLoading, setPageLoading } = usePageLoading();
    const { loading: deleteLoading, setLoading: setDeleteLoading } =
        useCustomLoading("delete-draft");
    const [searchTerm, setSearchTerm] = useState("");
    const [jenisFilter, setJenisFilter] = useState<string>("ALL");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(
        null,
    );
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const fetchApplications = useCallback(
        async (
            page = 1,
            search = searchTerm,
            jenis = jenisFilter,
            limit = pagination.limit,
        ) => {
            setPageLoading(true, "Memuat draft surat...");
            setFetchError(null);
            try {
                const { data, meta } = await getApplications({
                    status: "DRAFT",
                    page,
                    limit,
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
                const errorMessage = error instanceof Error ? error.message : "Gagal memuat draft surat";
                console.error("Failed to fetch applications:", error);
                setFetchError(errorMessage);
                setApplications([]);
                toast.error("Gagal memuat draft surat. Silakan coba lagi.");
            } finally {
                setPageLoading(false);
            }
        },
        [setPageLoading],
    );

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchApplications(1, searchTerm, jenisFilter, pagination.limit);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, jenisFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchApplications(
                newPage,
                searchTerm,
                jenisFilter,
                pagination.limit,
            );
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPagination((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
        fetchApplications(1, searchTerm, jenisFilter, newPageSize);
    };

    const handleDeleteDraft = async () => {
        if (!selectedDeleteId) return;

        setDeleteLoading(true, "Menghapus draft...");
        try {
            const res = await fetch(
                `/api/surat-rekomendasi/applications/${selectedDeleteId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );
            if (res.ok) {
                setIsDeleteDialogOpen(false);
                setSelectedDeleteId(null);
                fetchApplications(pagination.page);
            } else {
                const errorData = await res.json();
                setDeleteError(
                    errorData.error ||
                        "Gagal menghapus draft. Silakan coba lagi.",
                );
            }
        } catch (error) {
            console.error("Delete draft error:", error);
            setDeleteError(
                "Terjadi kesalahan saat menghapus draft. Silakan coba lagi.",
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const openDeleteDialog = (id: string) => {
        setSelectedDeleteId(id);
        setDeleteError(null);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href="/mahasiswa/surat/draft/surat-rekomendasi-beasiswa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Draft Surat
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">
                    Surat Rekomendasi Beasiswa
                </span>
            </nav>
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-slate-800">
                Draft Surat Rekomendasi Beasiswa
            </h1>
            <p className="text-sm text-slate-500 -mt-4">
                Lanjutkan pengajuan surat yang telah Anda simpan sebelumnya.
            </p>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">
                            Hapus Draft Surat
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                            Apakah Anda yakin ingin menghapus draft ini?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteError && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700 font-medium">
                                {deleteError}
                            </p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleteLoading}
                            className="rounded-3xl"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDraft}
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-3xl"
                        >
                            {deleteLoading ? (
                                <>
                                    <ButtonLoader />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus Draft"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Combined Filters and Table Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl py-0 gap-0">
                {/* Filters Section */}
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-50">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari draft..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 border-slate-100 bg-slate-50/50 w-full rounded-3xl"
                            />
                        </div>

                        {/* Filter Jenis */}
                        <Select
                            value={jenisFilter}
                            onValueChange={setJenisFilter}
                        >
                            <SelectTrigger
                                className="w-full sm:w-50 h-10 border-slate-100 text-slate-600 rounded-3xl"
                                suppressHydrationWarning
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Jenis Draft" />
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
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-undip-blue border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-white w-12 text-center">
                                    No
                                </th>
                                <th className="px-6 py-4 font-semibold text-white min-w-50">
                                    Subjek Surat
                                </th>
                                <th className="px-6 py-4 font-semibold text-white min-w-50">
                                    Terakhir Diubah
                                </th>
                                <th className="px-6 py-4 font-semibold text-white w-24">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fetchError ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="bg-red-50 rounded-full p-3">
                                                <AlertCircle className="h-8 w-8 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-semibold">
                                                    Gagal memuat draft surat
                                                </p>
                                                <p className="text-slate-500 text-sm mt-1">
                                                    {fetchError}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => fetchApplications(1, searchTerm, jenisFilter)}
                                                className="mt-2 bg-undip-blue hover:bg-sky-700 text-white flex items-center gap-2"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Coba Lagi
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
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
                                                Tidak ada Draft Surat tersimpan.
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                Belum ada draft yang tersimpan
                                                saat ini.
                                            </p>
                                        </div>
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
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-center text-slate-500 font-medium text-sm">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 group-hover:text-undip-blue transition-colors">
                                                            {app.scholarshipName ||
                                                                app.letterType
                                                                    ?.name ||
                                                                "Surat Rekomendasi Beasiswa"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 mt-0.5">
                                                            Beasiswa{" "}
                                                            {jenis ||
                                                                "internal"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">
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
                                                        href={`/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${app.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 text-undip-blue hover:bg-blue-50 font-medium px-4 h-9"
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
                                                            openDeleteDialog(
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

                {/* Standard Pagination */}
                <StandardPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.limit}
                    totalItems={pagination.total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    itemLabel="draft surat"
                />
            </Card>
        </div>
    );
}
