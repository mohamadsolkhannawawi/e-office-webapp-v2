import React from "react";
import { LetterList } from "@/components/features/dashboard/LetterList";
import { ChevronRight } from "lucide-react";
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
            currentStep: "1",
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
        // Use same logic as dashboard
        let target = "Supervisor Akademik";
        let status = "Perlu Tindakan";
        let statusColor = "bg-amber-500";

        if (app.status === "COMPLETED") {
            target = "Selesai";
            status = "Selesai";
            statusColor = "bg-emerald-500";
        } else if (app.status === "REJECTED") {
            target = "Ditolak";
            status = "Ditolak";
            statusColor = "bg-red-500";
        } else if (app.status === "REVISION") {
            target = "Revisi di Mahasiswa";
            status = "Proses";
            statusColor = "bg-undip-blue";
        } else if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
            const stepToRole: Record<number, string> = {
                1: "Supervisor Akademik",
                2: "Manajer TU",
                3: "Wakil Dekan 1",
                4: "UPA",
            };
            target = stepToRole[app.currentStep] || "Diproses";

            if (app.currentStep === 1) {
                status = "Perlu Tindakan";
                statusColor = "bg-amber-500";
            } else {
                status = "Proses";
                statusColor = "bg-undip-blue";
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
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href="/supervisor-akademik"
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
                rolePath="supervisor-akademik"
                detailBasePath="surat-rekomendasi-beasiswa"
                meta={meta}
            />
        </div>
    );
}
