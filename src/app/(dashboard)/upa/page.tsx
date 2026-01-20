import { headers } from "next/headers";
import { AdminDashboard } from "@/components/features/dashboard";
import { ApplicationSummary } from "@/lib/application-api";

type SearchParams = { [key: string]: string | string[] | undefined };

async function getDashboardData(searchParams: SearchParams) {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        // 1. Fetch Stats
        const statsRes = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications/stats`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );
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

        // 2. Fetch Recent Letters with Filters
        const query = new URLSearchParams({
            status: String(searchParams.status || ""),
            search: String(searchParams.search || ""),
            page: String(searchParams.page || "1"),
            limit: String(searchParams.limit || "5"),
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
            limit: 5,
            totalPages: 0,
        };

        // 3. Fetch Action Required Count (Step 4 - UPA)
        const actionRes = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications?currentStep=4&limit=1`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );
        const actionJson = await actionRes.json();
        const actionCount = actionJson.meta?.total || 0;

        return {
            stats: {
                actionRequired: actionCount,
                completedMonth: statsData.totalCompletedThisMonth || 0,
                totalMonth: statsData.totalCreatedThisMonth || 0,
                trend: statsData.trend,
                distribution: statsData.distribution,
            },
            recentLetters: appsData.map((app: ApplicationSummary) => ({
                id: app.id,
                applicant:
                    app.applicantName || app.formData?.namaLengkap || "N/A",
                subject: app.scholarshipName || "Surat Rekomendasi Beasiswa",
                date: new Date(app.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }),
                target: app.status === "COMPLETED" ? "Selesai" : "UPA",
                status:
                    app.status === "PENDING"
                        ? "Menunggu Verifikasi"
                        : app.status === "IN_PROGRESS"
                          ? "Proses"
                          : app.status === "COMPLETED"
                            ? "Selesai"
                            : app.status === "REJECTED"
                              ? "Ditolak"
                              : app.status,
                statusColor:
                    app.status === "PENDING" || app.status === "IN_PROGRESS"
                        ? "bg-amber-500"
                        : app.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : app.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-slate-500",
            })),
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

export default async function UPAPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;
    const data = await getDashboardData(searchParams);

    return (
        <AdminDashboard
            roleName="UPA"
            rolePath="upa"
            title="Dashboard Persuratan"
            description="Pusat kendali untuk mengelola semua surat Fakultas Sains dan Matematika."
            stats={data.stats}
            recentLetters={data.recentLetters}
            meta={data.meta}
        />
    );
}
