import React from "react";
import { LetterList } from "@/components/features/dashboard/LetterList";
import { ChevronRight } from "lucide-react";
import { headers } from "next/headers";
import { ApplicationSummary } from "@/lib/application-api";

async function getActionRequiredApplications() {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        // Fetch currentStep=1 (Supervisor)
        const res = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications?currentStep=1`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );

        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch (err) {
        console.error("Fetch actionable error:", err);
        return [];
    }
}

export default async function PerluTindakanPage() {
    const data = await getActionRequiredApplications();

    const letters = data.map((app: ApplicationSummary) => ({
        id: app.id,
        applicant: app.applicantName || app.formData?.namaLengkap || "N/A",
        subject: app.scholarshipName || "Surat Rekomendasi Beasiswa",
        date: new Date(app.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        target: "Supervisor Akademik",
        status:
            app.status === "PENDING"
                ? "Menunggu Verifikasi"
                : app.status === "IN_PROGRESS"
                  ? "Proses"
                  : app.status,
        statusColor: "bg-amber-500",
    }));

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
                rolePath="supervisor-akademik"
                detailBasePath="perlu-tindakan"
            />
        </div>
    );
}
