import { headers } from "next/headers";
import { AdminDashboard } from "@/components/features/dashboard";
import { ApplicationSummary } from "@/lib/application-api";
import {
    CheckCircle,
    XCircle,
    RotateCw,
    AlertCircle,
    Clock,
} from "lucide-react";

type SearchParams = { [key: string]: string | string[] | undefined };

async function getDashboardData(searchParams: SearchParams) {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        // 1. Fetch Stats (global stats for SRB)
        const statsRes = await fetch(`${apiUrl}/api/surat-rekomendasi/stats`, {
            headers: { Cookie: cookie || "" },
            cache: "no-store",
        });
        const statsJson = await statsRes.json();
        const statsData = statsJson.data || {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
            totalCreatedThisMonth: 0,
            totalCompletedThisMonth: 0,
            trend: [],
            distribution: {
                pending: 0,
                inProgress: 0,
                completed: 0,
                rejected: 0,
            },
        };

        // 2. Fetch Recent Letters for table (automatically scoped by backend for reviewer role)
        const query = new URLSearchParams({
            status: String(searchParams.status || ""),
            search: String(searchParams.search || ""),
            page: String(searchParams.page || "1"),
            limit: String(searchParams.limit || "10"),
            startDate: String(searchParams.startDate || ""),
            endDate: String(searchParams.endDate || ""),
        });

        const appsRes = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications?${query.toString()}`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );
        const appsJson = await appsRes.json();
        const appsData = appsJson.data || [];
        const appsMeta = appsJson.meta || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        };

        return {
            stats: {
                actionRequired: statsData.pending || 0,
                completedMonth: statsData.totalCompletedThisMonth || 0,
                totalMonth: statsData.totalCreatedThisMonth || 0,
                trend: statsData.trend,
                distribution: statsData.distribution,
            },
            recentLetters: appsData.map((app: ApplicationSummary) => {
                const stepToRole: Record<number, string> = {
                    1: "Supervisor Akademik",
                    2: "Manajer TU",
                    3: "Wakil Dekan 1",
                    4: "UPA",
                };

                let target = "Selesai";
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
                } else if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
                    target = stepToRole[app.currentStep] || "Diproses";

                    if (app.currentStep === 3) {
                        status = "Perlu Tindakan";
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
                    applicant:
                        app.applicantName || app.formData?.namaLengkap || "N/A",
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
            }),
            meta: appsMeta,
        };
    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        return {
            stats: {
                actionRequired: 0,
                completedMonth: 0,
                totalMonth: 0,
                trend: [],
                distribution: {
                    pending: 0,
                    inProgress: 0,
                    completed: 0,
                    rejected: 0,
                },
            },
            recentLetters: [],
            meta: { total: 0, page: 1, limit: 5, totalPages: 0 },
        };
    }
}

export default async function WakilDekanPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;
    const data = await getDashboardData(searchParams);

    return (
        <AdminDashboard
            roleName="Wakil Dekan 1"
            rolePath="wakil-dekan-1"
            title="Dashboard Persuratan"
            description="Pusat kendali untuk mengelola semua surat Fakultas Sains dan Matematika."
            stats={data.stats}
            recentLetters={data.recentLetters}
            meta={data.meta}
            detailBasePath="surat-rekomendasi-beasiswa"
        />
    );
}
