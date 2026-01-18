import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    ShieldCheck,
    User,
    PenTool,
    Hash,
} from "lucide-react";

interface TimelineItemProps {
    role: string;
    status: string;
    date: string;
    time: string;
    catatan?: string;
    isLast?: boolean;
}

function TimelineItem({
    role,
    status,
    date,
    time,
    catatan,
    isLast,
}: TimelineItemProps) {
    const getStatusConfig = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("diajukan"))
            return {
                color: "text-blue-600 bg-blue-50 border-blue-100",
                icon: <FileText className="h-3 w-3" />,
            };
        if (
            s.includes("disetujui") ||
            s.includes("selesai") ||
            s.includes("publikasi")
        )
            return {
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                icon: <CheckCircle2 className="h-3 w-3" />,
            };
        if (s.includes("ditolak"))
            return {
                color: "text-red-600 bg-red-50 border-red-100",
                icon: <XCircle className="h-3 w-3" />,
            };
        if (s.includes("revisi"))
            return {
                color: "text-orange-600 bg-orange-50 border-orange-100",
                icon: <RotateCcw className="h-3 w-3" />,
            };
        if (s.includes("verifikasi") || s.includes("menunggu"))
            return {
                color: "text-amber-600 bg-amber-50 border-amber-100",
                icon: <Clock className="h-3 w-3" />,
            };
        return {
            color: "text-slate-600 bg-slate-50 border-slate-100",
            icon: <ShieldCheck className="h-3 w-3" />,
        };
    };

    const getRoleIcon = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes("mahasiswa")) return <User className="h-3.5 w-3.5" />;
        if (r.includes("supervisor"))
            return <ShieldCheck className="h-3.5 w-3.5" />;
        if (r.includes("manajer"))
            return <ShieldCheck className="h-3.5 w-3.5 text-undip-blue" />;
        if (r.includes("dekan"))
            return <PenTool className="h-3.5 w-3.5 text-indigo-600" />;
        if (r.includes("upa"))
            return <Hash className="h-3.5 w-3.5 text-sky-600" />;
        return <ShieldCheck className="h-3.5 w-3.5" />;
    };

    const config = getStatusConfig(status);

    return (
        <div className="flex gap-4 relative pb-8 group">
            {!isLast && (
                <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-24px)] bg-slate-100 group-hover:bg-blue-100 transition-colors" />
            )}

            <div className="relative shrink-0 mt-1">
                <div
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-sm z-10 flex items-center justify-center transition-all ${config.color.split(" ")[1]}`}
                >
                    {getRoleIcon(role)}
                </div>
            </div>

            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 tracking-tight">
                            {role}
                        </span>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.color}`}
                        >
                            {config.icon}
                            {status}
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:text-right">
                        {date} • {time}
                    </div>
                </div>

                {catatan ? (
                    <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-inner">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                            &quot;{catatan}&quot;
                        </p>
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-400 font-medium">
                        Melanjutkan dokumen ke tahapan berikutnya tanpa catatan
                        tambahan.
                    </p>
                )}
            </div>
        </div>
    );
}

interface RiwayatSuratProps {
    applicationId?: string;
    status?: string;
    createdAt?: string;
    riwayat?: Array<{
        role: string;
        status: string;
        date: string;
        time: string;
        catatan?: string;
    }>;
}

export function RiwayatSurat({
    status,
    createdAt,
    riwayat,
}: RiwayatSuratProps) {
    // Generate default timeline based on status and createdAt
    const generateDefaultTimeline = () => {
        if (createdAt) {
            const date = new Date(createdAt);
            const dateStr = date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            const timeStr = date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });

            return [
                {
                    role: "Mahasiswa",
                    status:
                        status === "PENDING"
                            ? "Diajukan"
                            : status || "Diajukan",
                    date: dateStr,
                    time: timeStr,
                    catatan: undefined,
                },
            ];
        }
        return [];
    };

    const timeline = riwayat ||
        generateDefaultTimeline() || [
            {
                role: "Admin Surat",
                status: "Diajukan",
                date: "06 November 2021",
                time: "09:43:48",
                catatan: undefined,
            },
            {
                role: "Supervisor Akademik",
                status: "Verifikasi Supervisor Akademik",
                date: "05 November 2021",
                time: "07:12:34",
                catatan: "Sudah diverifikasi oleh Supervisor Akademik",
            },
            {
                role: "Supervisor Akademik",
                status: "Disetujui",
                date: "05 November 2021",
                time: "07:12:34",
                catatan: undefined,
            },
            {
                role: "Mahasiswa",
                status: "Diajukan",
                date: "04 November 2021",
                time: "14:58:12",
                catatan: undefined,
            },
        ];

    return (
        <Card className="border-none shadow-sm bg-white h-fit">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold text-gray-800">
                    Riwayat Surat{" "}
                    <span className="text-blue-600">({timeline.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-0">
                    {timeline.map((item, index) => (
                        <TimelineItem
                            key={index}
                            role={item.role}
                            status={item.status}
                            date={item.date}
                            time={item.time}
                            catatan={item.catatan}
                            isLast={index === timeline.length - 1}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
