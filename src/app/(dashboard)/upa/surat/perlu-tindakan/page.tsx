import React from "react";
import { LetterList } from "@/components/features/dashboard/LetterList";
import {
    ChevronRight,
    CheckCircle,
    XCircle,
    RotateCw,
    AlertCircle,
    Clock,
} from "lucide-react";
import { headers } from "next/headers";
import { ApplicationSummary } from "@/lib/application-api";
import Link from "next/link";

type SearchParams = { [key: string]: string | string[] | undefined };

async function getActionRequiredApplications(searchParams: SearchParams) {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        const query = new URLSearchParams({
            mode: "pending",
            currentStep: "4", // UPA
            status: (searchParams.status as string) || "",
            search: (searchParams.search as string) || "",
            page: (searchParams.page as string) || "1",
            limit: (searchParams.limit as string) || "10",
            startDate: (searchParams.startDate as string) || "",
            endDate: (searchParams.endDate as string) || "",
        });

        const res = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications?${query.toString()}`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );

        if (!res.ok)
            return {
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            };
        const json = await res.json();
        return json;
    } catch (err) {
        console.error("Fetch actionable error:", err);
        return {
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
}

export default async function PerluTindakanPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;
    const { data, meta } = await getActionRequiredApplications(searchParams);

    const letters = data.map((app: ApplicationSummary) => {
        const stepToRole: Record<number, string> = {
            1: "Supervisor Akademik",
            2: "Manajer TU",
            3: "Wakil Dekan 1",
            4: "UPA",
        };

        let target = "UPA";
        let status = "Perlu Tindakan";
        let statusColor = "bg-amber-500";
        let statusIcon: React.ReactNode = null;

        if (app.status === "COMPLETED") {
            target = "Arsip";
            status = "Terbit";
            statusColor = "bg-emerald-500 text-white";
            statusIcon = <CheckCircle className="w-4 h-4" />;
        } else if (app.status === "REJECTED") {
            target = "Ditolak";
            status = app.lastActorRole
                ? `Ditolak oleh ${app.lastActorRole}`
                : "Ditolak";
            statusColor = "bg-red-500 text-white";
            statusIcon = <XCircle className="w-4 h-4" />;
        } else if (app.status === "REVISION") {
            // Target adalah step berikutnya dari currentStep saat ini
            const nextStep = app.currentStep + 1;
            target = stepToRole[nextStep] || "Selesai";
            status = app.lastRevisionFromRole
                ? `Revisi dari ${app.lastRevisionFromRole}`
                : "Revisi Diperlukan";
            statusColor = "bg-sky-500 text-white";
            statusIcon = <RotateCw className="w-4 h-4" />;
        } else if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
            target = stepToRole[app.currentStep] || "Diproses";

            if (app.currentStep === 4) {
                status = "Menunggu Tindakan Anda";
                statusColor = "bg-amber-500 text-white";
                statusIcon = <AlertCircle className="w-4 h-4" />;
            } else {
                status = `Diproses di ${stepToRole[app.currentStep]}`;
                statusColor = "bg-blue-500 text-white";
                statusIcon = <Clock className="w-4 h-4" />;
            }
        }

        return {
            id: app.id,
            applicant: app.applicantName || app.formData?.namaLengkap || "N/A",
            subject:
                app.scholarshipName ||
                app.letterType?.name ||
                "Surat Rekomendasi Beasiswa",
            date: new Date(app.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            target,
            status,
            statusColor,
            statusIcon,
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href="/upa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Surat Masuk
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Perlu Tindakan</span>
            </nav>

            <LetterList
                title="Perlu Tindakan"
                letters={letters}
                rolePath="upa"
                detailBasePath="surat-rekomendasi-beasiswa"
                meta={meta}
            />
        </div>
    );
}
