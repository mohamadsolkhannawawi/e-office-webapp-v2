"use client";

import { ChevronRight } from "lucide-react";

const COMPLETED_LETTERS = [
    {
        id: 1,
        subject: "Surat Beasiswa Djarum",
        status: "Diterima",
        statusType: "success",
    },
    {
        id: 2,
        subject: "Surat Beasiswa BCA",
        status: "Ditolak",
        statusType: "error",
    },
];

export default function SuratSelesaiPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span>Persuratan</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Surat Selesai</span>
            </nav>

            {/* Page Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 border border-transparent">
                <h1 className="text-xl font-bold text-slate-800">
                    Surat Selesai
                </h1>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-slate-400 border-b border-gray-100">
                            <tr>
                                <th
                                    className="px-6 py-4 font-normal w-2/3"
                                    scope="col"
                                >
                                    Subjek Surat
                                </th>
                                <th
                                    className="px-6 py-3 font-normal w-1/3"
                                    scope="col"
                                >
                                    Status Surat
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {COMPLETED_LETTERS.map((letter) => (
                                <tr
                                    key={letter.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-5 font-medium text-slate-700">
                                        {letter.subject}
                                    </td>
                                    <td
                                        className={`px-6 py-5 font-bold ${
                                            letter.statusType === "success"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {letter.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
