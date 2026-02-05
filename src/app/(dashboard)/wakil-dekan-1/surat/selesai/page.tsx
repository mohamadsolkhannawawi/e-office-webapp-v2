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

async function getCompletedApplications(searchParams: SearchParams) {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        // Build query params - only include date params if they have valid values
        const queryParams: Record<string, string> = {
            mode: "processed",
            currentStep: "3", // Wakil Dekan 1
            search: String(searchParams.search || ""),
            page: String(searchParams.page || "1"),
            limit: String(searchParams.limit || "10"),
            sortOrder: String(searchParams.sortOrder || "desc"),
        };

        // Only add date params if they exist and are not empty
        if (
            searchParams.startDate &&
            String(searchParams.startDate).trim() !== ""
        ) {
            queryParams.startDate = String(searchParams.startDate);
        }
        if (
            searchParams.endDate &&
            String(searchParams.endDate).trim() !== ""
        ) {
            queryParams.endDate = String(searchParams.endDate);
        }

        const query = new URLSearchParams(queryParams);

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
        console.error("Fetch completed error:", err);
        return {
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
}

export default async function SelesaiPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;
    const { data, meta } = await getCompletedApplications(searchParams);

    const letters = data.map((app: ApplicationSummary) => {
        const stepToRole: Record<number, string> = {
            1: "Supervisor Akademik",
            2: "Manajer TU",
            3: "Wakil Dekan 1",
            4: "UPA",
        };

        let target = "Selesai Diproses";
        let status = "Proses";
        let statusColor = "bg-undip-blue";
        let statusIcon: React.ReactNode = null;

        if (app.status === "COMPLETED") {
            target = "Selesai";
            status = app.lastActorRole
                ? `Diterbitkan oleh ${app.lastActorRole}`
                : "Selesai";
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
                    href="/wakil-dekan-1/surat/selesai"
                    className="hover:text-undip-blue transition-colors"
                >
                    Surat Masuk
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Selesai</span>
            </nav>

            <LetterList
                title="Daftar Surat Selesai"
                letters={letters}
                rolePath="wakil-dekan-1"
                detailBasePath="surat-rekomendasi-beasiswa"
                meta={meta}
            />
        </div>
    );
}
