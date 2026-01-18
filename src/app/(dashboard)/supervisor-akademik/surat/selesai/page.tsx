"use client";

import React from "react";
import { LetterList } from "@/components/features/admin-dashboard/LetterList";
import { ChevronRight } from "lucide-react";

export default function SelesaiPage() {
    const letters = [
        {
            id: 10,
            applicant: "Maxwell Santosso",
            subject: "Surat Rekomendasi Beasiswa",
            date: "12 Agu 2023",
            target: "Selesai",
            status: "Selesai",
            statusColor: "bg-emerald-500",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span className="hover:text-undip-blue cursor-pointer">
                    Surat Masuk
                </span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Selesai</span>
            </nav>

            <LetterList
                title="Daftar Surat Selesai"
                letters={letters}
                rolePath="supervisor-akademik"
                detailBasePath="perlu-tindakan"
            />
        </div>
    );
}
