"use client";

import { ChevronRight } from "lucide-react";
import { LetterNumberingDashboard } from "@/components/features/surat-rekomendasi-beasiswa/management/LetterNumberingDashboard";

export default function LetterManagementPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <span>Dashboard</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-800 font-medium">
                        Manajemen Penomoran
                    </span>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Manajemen Penomoran
                    </h1>
                    <p className="text-slate-600">
                        Kelola dan monitor semua nomor surat yang telah
                        dipublikasikan
                    </p>
                </div>

                {/* Content */}
                <LetterNumberingDashboard />
            </div>
        </div>
    );
}
