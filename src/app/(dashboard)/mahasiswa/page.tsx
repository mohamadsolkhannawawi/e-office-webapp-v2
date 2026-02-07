"use client";

import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    FileText,
    Search,
    MoreHorizontal,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
    const { user } = useAuth();
    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb - Hidden on dashboard */}

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-slate-800 animate-in slide-in-from-bottom-3 duration-700">
                Dashboard
            </h1>
            {user?.name && (
                <p className="text-base text-slate-600 animate-in slide-in-from-bottom-3 duration-700 leading-relaxed">
                    Selamat datang{" "}
                    <span className="font-bold text-undip-blue">
                        {user.name}
                    </span>
                    , disini Anda bisa mengelola pengajuan surat dan dokumen
                    administratif dengan lebih mudah.
                </p>
            )}
            {!user?.name && (
                <p className="text-sm text-slate-500 animate-in slide-in-from-bottom-3 duration-700">
                    Kelola pengajuan surat dan dokumen administratif Anda dengan
                    mudah.
                </p>
            )}

            {/* Actions Grid */}
            <div className="grid gap-3 sm:gap-4">
                {DASHBOARD_ACTIONS.map((action, index) => (
                    <div
                        key={action.title}
                        className={`group bg-white rounded-3xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 animate-in slide-in-from-bottom-4 h-full ${
                            action.disabled
                                ? "opacity-60 cursor-not-allowed border-gray-200"
                                : "hover:shadow-md hover:border-blue-100 border-gray-200"
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
                                className="w-full sm:w-auto sm:min-w-50 md:min-w-60 lg:w-80 bg-gray-100 text-gray-400 rounded-full py-5 sm:py-6 font-semibold text-sm"
                            >
                                Belum Tersedia
                            </Button>
                        ) : (
                            <Link
                                href={action.href}
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full sm:w-auto sm:min-w-50 md:min-w-60 lg:w-80 bg-undip-blue hover:bg-sky-700 text-white rounded-full py-5 sm:py-6 font-semibold shadow-sm transition-all active:scale-95 text-sm">
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
