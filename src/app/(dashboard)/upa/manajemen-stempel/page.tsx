"use client";

import { UPAStampDashboard } from "@/components/features/surat-rekomendasi-beasiswa/management/UPAStampDashboard";

export default function StampManagementPage() {
    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Manajemen Stempel
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Kelola dan monitor semua template stempel digital yang
                    tersedia untuk diterapkan pada dokumen
                </p>
            </div>

            <UPAStampDashboard />
        </div>
    );
}
