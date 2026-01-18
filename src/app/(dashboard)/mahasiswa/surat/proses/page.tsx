"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Filter, Eye, Edit3, ChevronLeft } from "lucide-react";

const IN_PROGRESS_LETTERS = [
    {
        id: 1,
        subject: "Surat Beasiswa Djarum",
        status: "Revisi",
        statusType: "warning",
    },
    {
        id: 2,
        subject: "Surat Beasiswa BCA",
        status: "Menunggu Verifikasi",
        statusType: "secondary",
    },
];

export default function SuratDalamProsesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span>Persuratan</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Surat Dalam Proses</span>
            </nav>

            {/* Page Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 transition-all duration-200">
                <h1 className="text-xl font-bold text-slate-800">
                    Surat Dalam Proses
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
                            {IN_PROGRESS_LETTERS.map((letter) => (
                                <tr
                                    key={letter.id}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4 text-slate-700 font-medium">
                                        {letter.subject}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`font-bold ${
                                                letter.statusType === "warning"
                                                    ? "text-orange-500"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {letter.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-undip-blue hover:bg-sky-700 text-xs px-4 h-8"
                                            >
                                                Preview
                                            </Button>
                                            {letter.statusType ===
                                                "warning" && (
                                                <Button
                                                    size="sm"
                                                    className="bg-undip-blue hover:bg-sky-700 text-xs px-4 h-8"
                                                >
                                                    Revisi
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-1 gap-4">
                <span>Menampilkan 1 sampai 2 dari 2 entri</span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-xs h-8 px-2"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <Button
                        size="sm"
                        className="bg-undip-blue hover:bg-sky-700 text-xs h-8 w-8 p-0"
                    >
                        1
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-xs h-8 px-2"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
