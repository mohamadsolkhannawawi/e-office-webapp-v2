"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Filter, ChevronLeft } from "lucide-react";

export default function SuratSelesaiPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span>Persuratan</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Sudah Selesai</span>
            </nav>

            {/* Page Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 transition-all duration-200">
                <h1 className="text-xl font-bold text-slate-800">
                    Surat Sudah Selesai
                </h1>
            </div>

            {/* Empty State or Table Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                    Belum Ada Surat Selesai
                </h3>
                <p className="text-slate-500 max-w-xs mt-2">
                    Surat yang sudah melalui proses verifikasi dan
                    penandatanganan akan muncul di sini.
                </p>
            </div>
        </div>
    );
}
