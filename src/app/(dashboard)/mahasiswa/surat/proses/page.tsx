"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    Filter,
    ChevronLeft,
    Loader2,
    Search,
    Clock,
    AlertCircle,
    RotateCw,
    CheckCircle,
    XCircle,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

    const getStatusInfo = (app: ApplicationSummary) => {
        const roles = {
            0: "Mahasiswa",
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
                icon: <XCircle className="h-3.5 w-3.5" />,
            };
        }
        if (app.status === "REVISION") {
            if (app.currentStep === 0) {
                const revisionFromRole =
                    app.lastRevisionFromRole ||
                    getRoleName(app.currentStep + 1);
                return {
                    label: `Revisi dari ${revisionFromRole}`,
                    color: "text-orange-600 bg-orange-50",
                    icon: <RotateCw className="h-3.5 w-3.5" />,
                };
            } else {
                return {
                    label: `Sedang Diproses di ${getRoleName(app.currentStep)}`,
                    color: "text-blue-600 bg-blue-50",
                    icon: <Clock className="h-3.5 w-3.5" />,
                };
            }
        }
        if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
            return {
                label: `Menunggu Verifikasi ${getRoleName(app.currentStep)}`,
                color: "text-blue-600 bg-blue-50",
                icon: <AlertCircle className="h-3.5 w-3.5" />,
            };
        }
        if (app.status === "COMPLETED") {
            return {
                label: "Selesai",
                color: "text-green-600 bg-green-50",
                icon: <CheckCircle className="h-3.5 w-3.5" />,
            };
        }

        return {
            label: app.status,
            color: "text-slate-600 bg-slate-50",
            icon: <Clock className="h-3.5 w-3.5" />,
        };
    };

    const getTargetInfo = (app: ApplicationSummary) => {
        const roles = {
            0: "Mahasiswa",
            1: "Supervisor Akademik",
            2: "Manajer TU",
            3: "Wakil Dekan 1",
            4: "UPA",
        };
        const getRoleName = (step: number) =>
            roles[step as keyof typeof roles] || "Petugas";

        if (app.status === "REVISION" && app.currentStep === 0) {
            return "Revisi Mahasiswa";
        }
        if (app.status === "REJECTED") {
            return "Ditolak";
        }
        if (app.status === "COMPLETED") {
            return "Selesai";
        }

        const nextStep = Math.min(app.currentStep + 1, 4);
        return `Ke ${getRoleName(nextStep)}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href="/mahasiswa/surat/proses"
                    className="hover:text-undip-blue transition-colors"
                >
                    Surat Saya
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

            {/* Combined Filters and Table Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl py-0 gap-0">
                {/* Filters Section */}
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-50">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari surat..."
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
                                    <SelectValue placeholder="Jenis Surat" />
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
                                <th className="px-6 py-4 font-semibold text-white w-12">
                                    No
                                </th>
                                <th className="px-6 py-4 font-semibold text-white min-w-50">
                                    Subjek Surat
                                </th>
                                <th className="px-6 py-4 font-semibold text-white min-w-50">
                                    Status
                                </th>
                                <th className="px-6 py-4 font-semibold text-white min-w-50">
                                    Target Selanjutnya
                                </th>
                                <th className="px-6 py-4 font-semibold text-white w-24">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
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
                                        colSpan={5}
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
                                                Tidak ada surat yang sedang
                                                diproses.
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                Belum ada data surat yang
                                                tersedia saat ini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app, index) => {
                                    const statusInfo = getStatusInfo(app);
                                    const target = getTargetInfo(app);
                                    return (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                                {(pagination.page - 1) *
                                                    pagination.limit +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-800 group-hover:text-undip-blue transition-colors">
                                                    {app.scholarshipName ||
                                                        app.letterType?.name ||
                                                        "Surat Rekomendasi Beasiswa"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                                                >
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">
                                                {target}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={
                                                        app.status ===
                                                        "REVISION"
                                                            ? `/mahasiswa/surat/proses/detail/${app.id}`
                                                            : `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=proses`
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-3 gap-2 text-white bg-undip-blue hover:bg-sky-700 hover:text-white font-medium text-xs rounded-3xl"
                                                        title="Detail"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Detail
                                                    </Button>
                                                </Link>
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
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
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
                            <span className="text-xs text-slate-600 px-2">
                                {pagination.page} / {pagination.totalPages}
                            </span>
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
            </Card>
        </div>
    );
}
