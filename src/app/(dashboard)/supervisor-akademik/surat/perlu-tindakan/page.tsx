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
        statusColor: app.status === "REJECTED" ? "bg-red-500" : "bg-amber-500",
    }));

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
                detailBasePath="perlu-tindakan"
                meta={meta}
            />
        </div>
    );
}
