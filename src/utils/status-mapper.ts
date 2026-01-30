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
    // Handle constant-style names (e.g., WAKIL_DEKAN_1, SUPERVISOR_AKADEMIK)
    if (
        lower.includes("wakil") &&
        (lower.includes("dekan") || lower.includes("wd1"))
    )
        return "Wakil Dekan 1";
    if (
        lower.includes("manajer") ||
        (lower.includes("tu") && !lower.includes("status"))
    )
        return "Manajer TU";
    if (lower.includes("supervisor") || lower.includes("spv"))
        return "Supervisor Akademik";
    if (lower.includes("upa") || lower.includes("staff")) return "Staff UPA";
    if (lower.includes("mahasiswa") || lower.includes("mhs"))
        return "Mahasiswa";
    return role; // Fallback
}

// Helper to determine configuration (label, color, desc) based on status/action
export function getStatusConfig(
    status: string,
    actionType?: string,
    sender?: string,
    receiver?: string,
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

    // Status: PENDING / SUBMITTED / DIAJUKAN
    if (s === "pending" || s.includes("diajukan") || s === "submitted") {
        return {
            label: "Diajukan",
            color: "text-slate-600 bg-slate-50 border-slate-100",
            iconName: "FileText",
            defaultDesc: "Dokumen sedang menunggu review di tahap berikutnya.",
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
        // Only append receiver name if it's not "-" (unknown receiver)
        const label =
            receiver && receiver !== "-"
                ? `Revisi ke ${receiver}`
                : "Perlu Revisi";
        const defaultDesc =
            receiver && receiver !== "-"
                ? `Dokumen dikembalikan oleh ${senderRole} untuk diperbaiki oleh ${receiver}.`
                : `Dokumen dikembalikan oleh ${senderRole} untuk diperbaiki.`;
        return {
            label,
            color: "text-orange-600 bg-orange-50 border-orange-100",
            iconName: "RotateCcw",
            defaultDesc,
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

// Helper to determine receiver role based on action, sender role, and notes
export function getReceiverRole(
    action: string,
    currentStep?: number,
    catatan?: string,
    senderRole?: string,
): string {
    const actionLower = action?.toLowerCase() || "";

    // Infer step from sender role if available
    let inferredStep: number | null = null;
    if (senderRole) {
        const senderLower = senderRole.toLowerCase();
        if (senderLower.includes("supervisor")) inferredStep = 1;
        else if (senderLower.includes("manajer") || senderLower.includes("tu"))
            inferredStep = 2;
        else if (
            senderLower.includes("wakil") ||
            senderLower.includes("dekan") ||
            senderLower.includes("wd1")
        )
            inferredStep = 3;
        else if (senderLower.includes("upa")) inferredStep = 4;
    }

    const stepForMapping = inferredStep ?? currentStep ?? 1;

    if (actionLower === "approve") {
        // Step mapping: Backend uses 1-based steps
        // Step 1 (SPV) approves -> goes to Step 2 (Manajer TU)
        // Step 2 (TU) approves -> goes to Step 3 (Wakil Dekan 1)
        // Step 3 (WD1) approves -> goes to Step 4 (UPA/Publish)
        // Step 4 (UPA) approves -> COMPLETED
        const stepToRole: Record<number, string> = {
            1: "Manajer TU", // SPV (step 1) approves -> TU (step 2)
            2: "Wakil Dekan 1", // TU (step 2) approves -> WD1 (step 3)
            3: "Staff UPA", // WD1 (step 3) approves -> UPA (step 4)
            4: "Selesai", // UPA (step 4) publishes -> COMPLETED
        };
        return stepToRole[stepForMapping] || "-";
    } else if (actionLower === "revision") {
        // Try to extract target role from catatan if available
        if (catatan) {
            // First try to extract from [ke RoleName] format (appended by backend)
            const bracketMatch = catatan.match(/\[ke\s+([^\]]+)\]/i);
            if (bracketMatch && bracketMatch[1]) {
                return bracketMatch[1].trim();
            }

            // Check for role abbreviations in the note - use first occurrence
            const catatanLower = catatan.toLowerCase();

            // Look for patterns like "Revisi WD1 - SPV - MHS..." and get the SECOND role mentioned
            // (first is who's making the revision, second is who it goes to)
            const parts = catatanLower.split("-").map((p) => p.trim());
            if (parts.length >= 2) {
                // Skip first part (who's making revision) and check second part
                for (let i = 1; i < parts.length; i++) {
                    const part = parts[i];
                    if (part.includes("spv")) return "Supervisor Akademik";
                    if (part.includes("tu")) return "Manajer TU";
                    if (part.includes("wd1")) return "Wakil Dekan 1";
                    if (part.includes("mhs")) return "Mahasiswa";
                }
            }

            // Fallback: check anywhere in the note
            if (catatanLower.includes("spv")) return "Supervisor Akademik";
            if (catatanLower.includes("tu")) return "Manajer TU";
            if (catatanLower.includes("wd1")) return "Wakil Dekan 1";
            if (catatanLower.includes("mhs")) return "Mahasiswa";
        }
        return "-";
    } else if (actionLower === "reject") {
        return "Ditolak";
    } else if (actionLower === "resubmit") {
        // After revision is completed, document goes back to the role at the specified step
        // Using 1-based step numbering matching backend
        const stepToRole: Record<number, string> = {
            1: "Supervisor Akademik", // Resubmitted to SPV
            2: "Manajer TU", // Resubmitted to TU
            3: "Wakil Dekan 1", // Resubmitted to WD1
            4: "Staff UPA", // Resubmitted to UPA
        };
        return stepToRole[stepForMapping] || "-";
    }

    return "-";
}
