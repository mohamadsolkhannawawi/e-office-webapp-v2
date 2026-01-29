"use client";

import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    FileText,
    Search,
    MoreHorizontal,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

const DASHBOARD_ACTIONS = [
    {
        title: "Surat Rekomendasi Beasiswa",
        description: "Pengajuan surat untuk keperluan beasiswa",
        icon: <GraduationCap className="h-5 w-5" />,
        href: "/mahasiswa/surat/surat-rekomendasi-beasiswa",
        color: "bg-blue-50 text-undip-blue",
        disabled: false,
    },
    {
        title: "Surat Keterangan Aktif Kuliah",
        description: "Bukti keaktifan mahasiswa semester ini",
        icon: <FileText className="h-5 w-5" />,
        href: "#",
        color: "bg-gray-50 text-gray-400",
        disabled: true,
    },
    {
        title: "Surat Izin Penelitian",
        description: "Permohonan izin riset ke instansi terkait",
        icon: <Search className="h-5 w-5" />,
        href: "#",
        color: "bg-gray-50 text-gray-400",
        disabled: true,
    },
    {
        title: "Surat Lainnya",
        description: "Permohonan surat administrasi lainnya",
        icon: <MoreHorizontal className="h-5 w-5" />,
        href: "#",
        color: "bg-gray-50 text-gray-400",
        disabled: true,
    },
];

export default function MahasiswaDashboardPage() {
    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-xs sm:text-sm font-medium text-slate-500">
                <span className="text-slate-800">Dashboard</span>
                <ChevronRight className="mx-1 sm:mx-2 h-3 w-3 sm:h-4 sm:w-4" />
            </nav>

            {/* Actions Grid */}
            <div className="grid gap-3 sm:gap-4">
                {DASHBOARD_ACTIONS.map((action) => (
                    <div
                        key={action.title}
                        className={`group bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ${
                            action.disabled
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:shadow-md hover:border-blue-100"
                        }`}
                    >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${action.color} flex items-center justify-center shrink-0 transition-transform ${!action.disabled && "group-hover:scale-110"}`}
                            >
                                {action.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3
                                    className={`text-sm sm:text-base font-bold ${action.disabled ? "text-gray-400" : "text-slate-800"}`}
                                >
                                    {action.title}
                                    {action.disabled && (
                                        <span className="ml-2 text-[9px] sm:text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Segera Hadir
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                        {action.disabled ? (
                            <Button
                                disabled
                                className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] lg:w-80 bg-gray-100 text-gray-400 rounded-full py-5 sm:py-6 font-semibold text-sm"
                            >
                                Belum Tersedia
                            </Button>
                        ) : (
                            <Link
                                href={action.href}
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] lg:w-80 bg-undip-blue hover:bg-sky-700 text-white rounded-full py-5 sm:py-6 font-semibold shadow-sm transition-all active:scale-95 text-sm">
                                    Ajukan
                                </Button>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
