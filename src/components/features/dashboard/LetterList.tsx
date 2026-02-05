"use client";

import React from "react";
import {
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Letter {
    id: string | number;
    applicant: string;
    subject: string;
    date: string;
    target: string;
    status: string;
    statusColor: string;
    statusIcon?: React.ReactNode;
}

interface LetterListProps {
    title: string;
    letters: Letter[];
    rolePath: string;
    detailBasePath: string;
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function LetterList({
    title,
    letters,
    rolePath,
    detailBasePath,
    meta,
}: LetterListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Determine the 'from' parameter based on current pathname
    const isSelesaiPage = pathname.includes("/selesai");
    const isPerluTindakanPage = pathname.includes("/perlu-tindakan");
    const fromParam = isSelesaiPage
        ? "selesai"
        : isPerluTindakanPage
          ? "perlu-tindakan"
          : "";

    const [searchTerm, setSearchTerm] = useState(
        searchParams.get("search") || "",
    );

    // State untuk input tanggal (format YYYY-MM-DD untuk input type="date")
    const [startDateInput, setStartDateInput] = useState(() => {
        const start = searchParams.get("startDate");
        if (start) {
            const date = new Date(start);
            return date.toISOString().split("T")[0];
        }
        return "";
    });

    const [endDateInput, setEndDateInput] = useState(() => {
        const end = searchParams.get("endDate");
        if (end) {
            const date = new Date(end);
            return date.toISOString().split("T")[0];
        }
        return "";
    });

    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newSearchParams = new URLSearchParams(
                searchParams.toString(),
            );

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === "") {
                    newSearchParams.delete(key);
                } else {
                    newSearchParams.set(key, String(value));
                }
            });

            return newSearchParams.toString();
        },
        [searchParams],
    );

    // Auto-search effect with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only push if the term is different from the current URL param
            if (searchTerm !== (searchParams.get("search") || "")) {
                router.push(
                    `${pathname}?${createQueryString({ search: searchTerm, page: 1 })}`,
                    { scroll: false },
                );
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm, searchParams, pathname, router, createQueryString]);

    // Sync searchTerm with URL when it changes externally (e.g. back button)
    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        if (urlSearch !== searchTerm) {
            // Wrap in timeout to avoid 'synchronous' setState warning
            const t = setTimeout(() => setSearchTerm(urlSearch), 0);
            return () => clearTimeout(t);
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const triggerSearch = () => {
        // Still keep this for explicit Enter key if needed, or just let useEffect handle it
        router.push(
            `${pathname}?${createQueryString({ search: searchTerm, page: 1 })}`,
        );
    };

    const handleSortChange = (sort: string) => {
        router.push(
            `${pathname}?${createQueryString({ sortOrder: sort, page: 1 })}`,
            { scroll: false },
        );
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && (!meta || newPage <= meta.totalPages)) {
            router.push(`${pathname}?${createQueryString({ page: newPage })}`);
        }
    };

    const handleStartDateChange = (value: string) => {
        setStartDateInput(value);

        // Auto-apply filter jika kedua tanggal sudah terisi
        if (value && endDateInput) {
            applyDateFilter(value, endDateInput);
        } else if (!value && !endDateInput) {
            // Reset filter jika kedua kosong
            router.push(
                `${pathname}?${createQueryString({ startDate: null, endDate: null, page: 1 })}`,
                { scroll: false },
            );
        }
    };

    const handleEndDateChange = (value: string) => {
        setEndDateInput(value);

        // Auto-apply filter jika kedua tanggal sudah terisi
        if (startDateInput && value) {
            applyDateFilter(startDateInput, value);
        } else if (!startDateInput && !value) {
            // Reset filter jika kedua kosong
            router.push(
                `${pathname}?${createQueryString({ startDate: null, endDate: null, page: 1 })}`,
                { scroll: false },
            );
        }
    };

    const applyDateFilter = (start: string, end: string) => {
        // Konversi YYYY-MM-DD ke Date object dengan timezone lokal
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        router.push(
            `${pathname}?${createQueryString({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                page: 1,
            })}`,
            { scroll: false },
        );
    };

    const clearDateFilter = () => {
        setStartDateInput("");
        setEndDateInput("");
        router.push(
            `${pathname}?${createQueryString({ startDate: null, endDate: null, page: 1 })}`,
            { scroll: false },
        );
    };

    return (
        <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden bg-white rounded-3xl py-0 gap-0">
            <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            className="pl-10 h-10 border-slate-100 bg-slate-50/50 w-full rounded-3xl"
                            placeholder="Cari surat..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && triggerSearch()
                            }
                        />
                    </div>

                    {/* Date Range Filter - Stylish Design */}
                    <div className="flex items-center gap-2 bg-slate-50/50 rounded-3xl p-2 border border-slate-100">
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
                                    className="h-9 w-[140px] text-sm border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-3xl"
                                    value={startDateInput}
                                    onChange={(e) =>
                                        handleStartDateChange(e.target.value)
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
                                    className="h-9 w-[140px] text-sm border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-3xl"
                                    value={endDateInput}
                                    onChange={(e) =>
                                        handleEndDateChange(e.target.value)
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
                                    onClick={clearDateFilter}
                                    title="Hapus filter tanggal"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )}
                    </div>

                    <Select
                        defaultValue={searchParams.get("sortOrder") || "desc"}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger
                            className="w-full sm:w-40 h-10 border-slate-100 text-slate-600 rounded-3xl"
                            suppressHydrationWarning
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Urutkan" />
                            </div>
                        </SelectTrigger>
                        <SelectContent suppressHydrationWarning>
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
                            <th className="px-6 py-4">Pengirim / Pemohon</th>
                            <th className="px-6 py-4">Perihal</th>
                            <th className="px-6 py-4">Tanggal Diterima</th>
                            <th className="px-6 py-4">Tujuan Saat Ini</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {letters.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
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
                                            Belum ada data surat yang tersedia
                                            saat ini.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            letters.map((letter, index) => (
                                <tr
                                    key={letter.id}
                                    className="hover:bg-slate-50/30 transition-colors group"
                                >
                                    <td className="px-6 py-4 text-slate-500">
                                        {meta
                                            ? (meta.page - 1) * meta.limit +
                                              index +
                                              1
                                            : index + 1}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {letter.applicant}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {letter.subject}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {letter.date}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-undip-blue">
                                        {letter.target}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {letter.statusIcon && (
                                                <div className="text-slate-500">
                                                    {letter.statusIcon}
                                                </div>
                                            )}
                                            {!letter.statusIcon && (
                                                <div
                                                    className={`w-2 h-2 rounded-full ${letter.statusColor}`}
                                                ></div>
                                            )}
                                            <span
                                                className={`text-[11px] font-bold uppercase ${letter.statusColor === "bg-red-500" ? "text-red-500" : "text-slate-500"}`}
                                            >
                                                {letter.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            href={`/${rolePath}/surat/${detailBasePath}/detail/${letter.id}${fromParam ? `?from=${fromParam}` : ""}`}
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

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-bold text-slate-400">
                        Menampilkan{" "}
                        <span className="text-slate-600">
                            {(meta.page - 1) * meta.limit + 1}-
                            {Math.min(meta.page * meta.limit, meta.total)}
                        </span>{" "}
                        dari{" "}
                        <span className="text-slate-600">{meta.total}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400"
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from(
                            { length: Math.min(5, meta.totalPages) },
                            (_, i) => {
                                // Basic pagination logic: show pages around meta.page
                                let pageNum = meta.page - 2 + i;
                                if (meta.page <= 2) pageNum = i + 1;
                                if (meta.page >= meta.totalPages - 1)
                                    pageNum = meta.totalPages - 4 + i;

                                if (pageNum < 1 || pageNum > meta.totalPages)
                                    return null;

                                return (
                                    <Button
                                        key={pageNum}
                                        className={`h-8 w-8 text-xs font-bold ${meta.page === pageNum ? "bg-undip-blue hover:bg-sky-700" : "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none border-none"}`}
                                        onClick={() =>
                                            handlePageChange(pageNum)
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
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page >= meta.totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
