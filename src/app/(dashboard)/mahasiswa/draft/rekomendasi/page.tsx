"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Filter } from "lucide-react";

const DRAFT_LETTERS = [
    {
        id: 1,
        subject: "Surat Beasiswa Djarum",
    },
    {
        id: 2,
        subject: "Surat Beasiswa BCA",
    },
];

export default function DrafSuratPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span>Persuratan</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Draf Surat</span>
            </nav>

            {/* Page Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 border border-transparent">
                <h1 className="text-xl font-bold text-slate-800">Draf Surat</h1>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center">
                <Button
                    variant="outline"
                    className="bg-white border-gray-200 text-slate-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg"
                >
                    Filter Jenis Surat
                    <Filter className="h-4 w-4 text-gray-400" />
                </Button>
            </div>

            {/* List Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-white border-b border-gray-100 px-6 py-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Subjek Surat
                    </h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {DRAFT_LETTERS.map((draft) => (
                        <div
                            key={draft.id}
                            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                        >
                            <span className="text-sm font-semibold text-slate-700">
                                {draft.subject}
                            </span>
                            <div className="w-full sm:w-auto">
                                <Button className="w-full sm:w-32 bg-undip-blue hover:bg-sky-700 text-white rounded-lg font-medium shadow-sm h-10">
                                    Lanjutkan
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
