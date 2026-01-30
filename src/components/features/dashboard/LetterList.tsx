"use client";

import React from "react";
import {
    Search,
    Calendar,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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

    const [searchTerm, setSearchTerm] = useState(
        searchParams.get("search") || "",
    );
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: searchParams.get("startDate")
            ? new Date(searchParams.get("startDate")!)
            : undefined,
        to: searchParams.get("endDate")
            ? new Date(searchParams.get("endDate")!)
            : undefined,
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
        );
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && (!meta || newPage <= meta.totalPages)) {
            router.push(`${pathname}?${createQueryString({ page: newPage })}`);
        }
    };

    const handleDateChange = (
        range: { from?: Date; to?: Date } | undefined,
    ) => {
        if (!range) {
            // Jika range kosong/direset
            setDateRange({});
            router.push(
                `${pathname}?${createQueryString({ startDate: "", endDate: "" })}`,
            );
            return;
        }

        setDateRange(range);

        // Hanya update URL jika kedua tanggal (from & to) sudah dipilih
        if (range.from && range.to) {
            // Set endDate ke akhir hari (23:59:59.999) agar mencakup semua data di hari tersebut
            const endDate = new Date(range.to);
            endDate.setHours(23, 59, 59, 999);

            router.push(
                `${pathname}?${createQueryString({
                    startDate: range.from.toISOString(),
                    endDate: endDate.toISOString(),
                })}`,
            );
        }
    };

    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="p-6 border-b border-slate-50 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            className="pl-10 h-10 border-slate-100 bg-slate-50/50 w-full"
                            placeholder="Cari surat..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && triggerSearch()
                            }
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-10 border-slate-100 text-slate-600 gap-2 w-full sm:w-50"
                            >
                                <Calendar className="h-4 w-4" />
                                {dateRange.from && dateRange.to
                                    ? `${format(dateRange.from, "dd LLL", { locale: id })} - ${format(dateRange.to, "dd LLL", { locale: id })}`
                                    : "Rentang Tanggal"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                mode="range"
                                selected={{
                                    from: dateRange.from,
                                    to: dateRange.to,
                                }}
                                onSelect={(
                                    range:
                                        | { from?: Date; to?: Date }
                                        | undefined,
                                ) => handleDateChange(range)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Select
                        defaultValue={searchParams.get("sortOrder") || "desc"}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-full sm:w-50 h-10 border-slate-100 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Urutkan" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Terbaru</SelectItem>
                            <SelectItem value="asc">Terlama</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-undip-blue border-b border-slate-50 text-[11px] uppercase text-white font-bold tracking-wider">
                                <th className="px-6 py-4 w-12">No</th>
                                <th className="px-6 py-4">
                                    Pengirim / Pemohon
                                </th>
                                <th className="px-6 py-4">Perihal</th>
                                <th className="px-6 py-4">Tanggal Diterima</th>
                                <th className="px-6 py-4">Tujuan Saat Ini</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {letters.map((letter, index) => (
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
                                            href={`/${rolePath}/surat/${detailBasePath}/detail/${letter.id}`}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
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
