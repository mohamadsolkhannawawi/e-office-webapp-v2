"use client";

import React from "react";
import { LetterList } from "@/components/features/admin-dashboard/LetterList";
import { ChevronRight } from "lucide-react";

export default function PerluTindakanPage() {
    const letters = [
        {
            id: 1,
            applicant: "Ahmad Syaifullah",
            subject: "Surat Rekomendasi Beasiswa",
            date: "14 Agu 2023",
            target: "UPA",
            status: "Menunggu Verifikasi",
            statusColor: "bg-amber-500",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span className="hover:text-undip-blue cursor-pointer">
                    Surat Masuk
                </span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Perlu Tindakan</span>
            </nav>

            <LetterList
                title="Perlu Tindakan"
                letters={letters}
                rolePath="upa"
                detailBasePath="perlu-tindakan"
            />
        </div>
    );
}
