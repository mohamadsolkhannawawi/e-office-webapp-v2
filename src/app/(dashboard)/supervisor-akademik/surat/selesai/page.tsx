import React from "react";
import { LetterList } from "@/components/features/dashboard/LetterList";
import { ChevronRight } from "lucide-react";
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

        const query = new URLSearchParams({
            mode: "processed",
            currentStep: "1",
            search: String(searchParams.search || ""),
            page: String(searchParams.page || "1"),
            limit: String(searchParams.limit || "10"),
            startDate: String(searchParams.startDate || ""),
            endDate: String(searchParams.endDate || ""),
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
        // Use same logic as dashboard
        let target = "Selesai";
        let status = "Proses";
        let statusColor = "bg-undip-blue";

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
                <span className="text-slate-800">Selesai</span>
            </nav>

            <LetterList
                title="Daftar Surat Selesai"
                letters={letters}
                rolePath="supervisor-akademik"
                detailBasePath="surat-rekomendasi-beasiswa"
                meta={meta}
            />
        </div>
    );
}
