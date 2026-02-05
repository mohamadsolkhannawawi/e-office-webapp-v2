"use client";

import { ChevronRight } from "lucide-react";
import { LetterNumberingDashboard } from "@/components/features/surat-rekomendasi-beasiswa/management/LetterNumberingDashboard";

export default function LetterManagementPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
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
    );
}
