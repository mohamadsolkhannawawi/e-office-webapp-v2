"use client";

import { WD1SignatureDashboard } from "@/components/features/surat-rekomendasi-beasiswa/management/WD1SignatureDashboard";

export default function SignatureManagementPage() {
    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Manajemen Tanda Tangan
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Kelola dan simpan template tanda tangan digital Anda untuk
                    diterapkan pada dokumen resmi
                </p>
            </div>

            <WD1SignatureDashboard />
        </div>
    );
}
