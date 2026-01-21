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
    Check,
} from "lucide-react";

interface TimelineItemProps {
    senderRole: string;
    receiverRole?: string;
    status: string;
    date: string;
    time: string;
    catatan?: string;
    actionType?: string;
    isLast?: boolean;
}

function TimelineItem({
    senderRole,
    receiverRole,
    status,
    date,
    time,
    catatan,
    actionType,
    isLast,
}: TimelineItemProps) {
    // Helper to format role names to be more friendly
    const formatRoleName = (role: string) => {
        const lower = role.toLowerCase();
        if (lower.includes("wakil dekan")) return "Wakil Dekan 1";
        if (lower.includes("manajer")) return "Manajer TU";
        if (lower.includes("supervisor")) return "Supervisor Akademik";
        if (lower.includes("upa")) return "Staff UPA";
        if (lower.includes("mahasiswa")) return "Mahasiswa";
        return role; // Fallback
    };

    const friendlySender = formatRoleName(senderRole);
    const friendlyReceiver = receiverRole
        ? formatRoleName(receiverRole)
        : undefined;

    // Treat "-" as no note
    const hasCatatan = catatan && catatan !== "-" && catatan.trim() !== "";

    const getStatusConfig = (
        status: string,
        actionType?: string,
        sender?: string,
    ) => {
        const s = status.toLowerCase();
        const a = actionType?.toLowerCase() || "";

        // Status: COMPLETED / PUBLISHED
        if (
            s === "completed" ||
            s === "published" ||
            s.includes("selesai") ||
            s.includes("terbit")
        ) {
            return {
                label: "Selesai / Terbit",
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                icon: <CheckCircle2 className="h-3 w-3" />,
                defaultDesc:
                    "Dokumen telah selesai, ditandatangani, dan diterbitkan.",
            };
        }

        // Status: REJECTED
        if (s === "rejected" || s.includes("tolak")) {
            return {
                label: "Ditolak",
                color: "text-red-600 bg-red-50 border-red-100",
                icon: <XCircle className="h-3 w-3" />,
                defaultDesc: `Pengajuan ditolak oleh ${sender || "Reviewer"}.`,
            };
        }

        // Status: REVISION / REVISED
        if (s === "revision" || s === "revised" || s.includes("revisi")) {
            return {
                label: "Perlu Revisi",
                color: "text-orange-600 bg-orange-50 border-orange-100",
                icon: <RotateCcw className="h-3 w-3" />,
                defaultDesc: `Dokumen dikembalikan oleh ${sender || "Reviewer"} untuk diperbaiki.`,
            };
        }

        // Action: APPROVE
        if (a === "approve") {
            let desc = `Dokumen telah disetujui oleh ${sender} dan diteruskan ke tahap berikutnya.`;

            if (sender?.toLowerCase().includes("dekan")) {
                desc =
                    "Dokumen telah disetujui dan ditandatangani secara digital.";
            } else if (sender?.toLowerCase().includes("upa")) {
                desc = "Dokumen telah diterbitkan dan dapat diunduh.";
            }

            return {
                label: "Disetujui",
                color: "text-blue-600 bg-blue-50 border-blue-100",
                icon: <Check className="h-3 w-3" />,
                defaultDesc: desc,
            };
        }

        // Action: SUBMIT
        if (a === "submit" || a === "create" || s === "pending") {
            return {
                label: "Diajukan",
                color: "text-blue-600 bg-blue-50 border-blue-100",
                icon: <FileText className="h-3 w-3" />,
                defaultDesc: "Pengajuan baru telah berhasil dikirim.",
            };
        }

        // Fallback / In Progress
        return {
            label: "Diproses",
            color: "text-slate-600 bg-slate-50 border-slate-100",
            icon: <Clock className="h-3 w-3" />,
            defaultDesc: "Dokumen sedang diproses di tahap ini.",
        };
    };

    const getRoleIcon = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes("mahasiswa")) return <User className="h-3.5 w-3.5" />;
        if (r.includes("supervisor"))
            return <ShieldCheck className="h-3.5 w-3.5" />;
        if (r.includes("manajer"))
            return <ShieldCheck className="h-3.5 w-3.5 text-undip-blue" />;
        if (r.includes("dekan") || r.includes("wd1"))
            return <PenTool className="h-3.5 w-3.5 text-indigo-600" />;
        if (r.includes("upa"))
            return <Hash className="h-3.5 w-3.5 text-sky-600" />;
        return <ShieldCheck className="h-3.5 w-3.5" />;
    };

    const config = getStatusConfig(status, actionType, friendlySender);

    return (
        <div className="flex gap-4 relative pb-8 group">
            {!isLast && (
                <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-24px)] bg-slate-100 group-hover:bg-blue-100 transition-colors" />
            )}

            <div className="relative shrink-0 mt-1">
                <div
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-sm z-10 flex items-center justify-center transition-all ${config.color.split(" ")[1]}`}
                >
                    {getRoleIcon(senderRole)}
                </div>
            </div>

            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 tracking-tight">
                                {friendlySender}
                                {friendlyReceiver && (
                                    <span className="text-slate-400 font-normal ml-2 mr-1">
                                        → {friendlyReceiver}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider w-fit ${config.color}`}
                        >
                            {config.icon}
                            {config.label}
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:text-right">
                        {date} • {time}
                    </div>
                </div>

                {hasCatatan ? (
                    <div className="p-3 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-inner">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                            &quot;{catatan}&quot;
                        </p>
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-400 font-medium">
                        {config.defaultDesc}
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
        senderRole: string;
        receiverRole?: string;
        status: string;
        date: string;
        time: string;
        catatan?: string;
        actionType?: string;
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
                    senderRole: "Mahasiswa",
                    receiverRole: "Supervisor Akademik",
                    status:
                        status === "PENDING"
                            ? "Diajukan"
                            : status || "Diajukan",
                    date: dateStr,
                    time: timeStr,
                    catatan: undefined,
                    actionType: "submit",
                },
            ];
        }
        return [];
    };

    const timeline = [
        ...(riwayat || []),
        ...(riwayat?.some(
            (r) => r.actionType === "submit" || r.actionType === "create",
        )
            ? []
            : generateDefaultTimeline()),
    ];

    return (
        <Card className="border-none shadow-sm bg-white h-fit">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className=" text-sm uppercase tracking-wider font-bold text-gray-800">
                    Riwayat Surat{" "}
                    <span className="text-blue-600">({timeline.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-0">
                    {timeline.map((item, index) => (
                        <TimelineItem
                            key={index}
                            senderRole={item.senderRole}
                            receiverRole={item.receiverRole}
                            status={item.status}
                            date={item.date}
                            time={item.time}
                            catatan={item.catatan}
                            actionType={item.actionType}
                            isLast={index === timeline.length - 1}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
