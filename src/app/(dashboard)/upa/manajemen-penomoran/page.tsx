"use client";

import { LetterNumberingDashboard } from "@/components/features/surat-rekomendasi-beasiswa/management/LetterNumberingDashboard";

export default function LetterManagementPage() {
    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Manajemen Penomoran
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Kelola dan monitor semua nomor surat yang telah
                    dipublikasikan
                </p>
            </div>

            <LetterNumberingDashboard />
        </div>
    );
}
