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
    ArrowRight,
} from "lucide-react";
import { formatRoleName, getStatusConfig } from "@/utils/status-mapper";

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
    const friendlySender = formatRoleName(senderRole);
    const friendlyReceiver = receiverRole
        ? formatRoleName(receiverRole)
        : undefined;

    // Treat "-" dan "Initial submission" (case-insensitive, trim) as no note
    const catatanTrim = (catatan || "").trim().toLowerCase();
    const isInitialSubmission =
        (actionType === "submit" || actionType === "create") &&
        (!catatanTrim ||
            catatanTrim === "initial submission" ||
            catatanTrim === "-");
    const hasCatatan =
        catatanTrim !== "" &&
        catatanTrim !== "-" &&
        catatanTrim !== "initial submission";

    // For initial submission, always use "PENDING" status to show "Diajukan"
    const displayStatus = isInitialSubmission ? "PENDING" : status;
    const config = getStatusConfig(
        displayStatus,
        actionType,
        friendlySender,
        isInitialSubmission ? undefined : friendlyReceiver, // Don't show receiver for initial submission
    );

    const getIconComponent = (name: string) => {
        switch (name) {
            case "CheckCircle2":
                return <CheckCircle2 className="h-3 w-3" />;
            case "XCircle":
                return <XCircle className="h-3 w-3" />;
            case "RotateCcw":
                return <RotateCcw className="h-3 w-3" />;
            case "Check":
                return <Check className="h-3 w-3" />;
            case "FileText":
                return <FileText className="h-3 w-3" />;
            case "Clock":
            default:
                return <Clock className="h-3 w-3" />;
        }
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

    // Custom defaultDesc untuk initial submission
    let customDefaultDesc = config.defaultDesc;
    if (isInitialSubmission) {
        customDefaultDesc =
            "Pengajuan surat telah berhasil dikirim ke Supervisor Akademik.";
    }

    return (
        <div className="flex gap-4 relative pb-8 group">
            {!isLast && (
                <div className="absolute left-2.75 top-8 w-0.5 h-[calc(100%-24px)] bg-slate-100 group-hover:bg-blue-100 transition-colors" />
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
                                    <span className="text-slate-400 font-normal ml-2 mr-1 flex items-center gap-1">
                                        <ArrowRight className="inline h-4 w-4 align-middle" />{" "}
                                        {friendlyReceiver}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider w-fit ${config.color}`}
                        >
                            {getIconComponent(config.iconName)}
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
                        {customDefaultDesc}
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

    // Filter dan modifikasi: jika ada entry Mahasiswa→- Diajukan (submit/create), dan setelahnya ada Mahasiswa→Supervisor Akademik (atau role lain), maka hide yang initial submission
    const filteredRiwayat = (riwayat || [])
        .filter((item) => {
            // Jika entry adalah Mahasiswa → "-" dengan Diajukan status, skip it (remove dari timeline)
            if (
                item.senderRole.toLowerCase().includes("mahasiswa") &&
                (!item.receiverRole || item.receiverRole === "-") &&
                (item.status === "Diajukan" ||
                    item.actionType === "submit" ||
                    item.actionType === "create")
            ) {
                return false; // Filter out this entry
            }
            return true;
        })
        .map((item, idx) => {
            // Jika pengajuan awal (receiverRole kosong atau '-') maka set ke Supervisor Akademik
            if (
                idx === 0 &&
                item.senderRole.toLowerCase().includes("mahasiswa") &&
                (!item.receiverRole || item.receiverRole === "-") &&
                (item.status === "Diajukan" ||
                    item.actionType === "submit" ||
                    item.actionType === "create")
            ) {
                return { ...item, receiverRole: "Supervisor Akademik" };
            }
            return item;
        });

    const timeline = [
        ...filteredRiwayat,
        ...(filteredRiwayat.some(
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
                    {timeline
                        .slice()
                        .reverse()
                        .map((item, index) => (
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
