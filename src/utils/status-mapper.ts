// Icon imports removed as we return string names for icons
// The consumer component (RiwayatSurat) handles the actual icon rendering

export interface StatusConfig {
    label: string;
    color: string;
    defaultDesc: string;
    iconName:
        | "FileText"
        | "CheckCircle2"
        | "Clock"
        | "XCircle"
        | "RotateCcw"
        | "Check";
}

// Helper to format role names to be more friendly and polite
export function formatRoleName(role: string): string {
    const lower = role.toLowerCase();
    if (lower.includes("wakil dekan")) return "Wakil Dekan 1";
    if (lower.includes("manajer")) return "Manajer TU";
    if (lower.includes("supervisor")) return "Supervisor Akademik";
    if (lower.includes("upa")) return "Staff UPA";
    if (lower.includes("mahasiswa")) return "Mahasiswa";
    return role; // Fallback
}

// Helper to determine configuration (label, color, desc) based on status/action
export function getStatusConfig(
    status: string,
    actionType?: string,
    sender?: string,
): StatusConfig {
    const s = status.toLowerCase();
    const a = actionType?.toLowerCase() || "";
    const senderRole = sender ? formatRoleName(sender) : "Reviewer";

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
            iconName: "CheckCircle2",
            defaultDesc:
                "Dokumen telah selesai, ditandatangani, dan diterbitkan.",
        };
    }

    // Status: REJECTED
    if (s === "rejected" || s.includes("tolak")) {
        return {
            label: "Ditolak",
            color: "text-red-600 bg-red-50 border-red-100",
            iconName: "XCircle",
            defaultDesc: `Pengajuan ditolak oleh ${senderRole}.`,
        };
    }

    // Status: REVISION / REVISED
    if (s === "revision" || s === "revised" || s.includes("revisi")) {
        return {
            label: "Perlu Revisi",
            color: "text-orange-600 bg-orange-50 border-orange-100",
            iconName: "RotateCcw",
            defaultDesc: `Dokumen dikembalikan oleh ${senderRole} untuk diperbaiki.`,
        };
    }

    // Action: APPROVE
    if (a === "approve") {
        let desc = `Dokumen telah disetujui oleh ${senderRole} dan diteruskan ke tahap berikutnya.`;

        if (senderRole === "Wakil Dekan 1") {
            desc = "Dokumen telah disetujui dan ditandatangani secara digital.";
        } else if (senderRole === "Staff UPA") {
            desc = "Dokumen telah diterbitkan dan dapat diunduh.";
        }

        return {
            label: "Disetujui",
            color: "text-blue-600 bg-blue-50 border-blue-100",
            iconName: "Check",
            defaultDesc: desc,
        };
    }

    // Action: RESUBMIT
    if (a === "resubmit") {
        return {
            label: "Revisi Selesai",
            color: "text-green-600 bg-green-50 border-green-100",
            iconName: "FileText",
            defaultDesc:
                "Revisi telah selesai dan pengajuan disubmit ulang untuk ditinjau kembali.",
        };
    }

    // Action: SUBMIT
    if (a === "submit" || a === "create" || s === "pending") {
        return {
            label: "Diajukan",
            color: "text-blue-600 bg-blue-50 border-blue-100",
            iconName: "FileText",
            defaultDesc: "Pengajuan baru telah berhasil dikirim.",
        };
    }

    // Fallback / In Progress
    return {
        label: "Diproses",
        color: "text-slate-600 bg-slate-50 border-slate-100",
        iconName: "Clock",
        defaultDesc: "Dokumen sedang diproses di tahap ini.",
    };
}

// Helper to determine receiver role based on action and current step
export function getReceiverRole(action: string, currentStep?: number): string {
    const actionLower = action?.toLowerCase() || "";

    if (actionLower === "approve") {
        const stepToRole: Record<number, string> = {
            1: "Manajer TU",
            2: "Wakil Dekan 1",
            3: "Staff UPA",
            4: "Selesai",
        };
        return stepToRole[currentStep || 1] || "-";
    } else if (actionLower === "revision") {
        return "Revisi";
    } else if (actionLower === "reject") {
        return "Ditolak";
    } else if (actionLower === "resubmit") {
        // Determine receiver based on current step after resubmit
        const stepToRole: Record<number, string> = {
            1: "Supervisor Akademik",
            2: "Manajer TU",
            3: "Wakil Dekan 1",
            4: "Staff UPA",
        };
        return stepToRole[currentStep || 1] || "-";
    }

    return "-";
}
