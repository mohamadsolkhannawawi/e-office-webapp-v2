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

        // 2. Fetch Pending Count (letters awaiting action at step 1)
        const pendingRes = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications?mode=pending&currentStep=1&limit=1`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );
        const pendingJson = await pendingRes.json();
        const pendingCount = pendingJson.meta?.total || 0;

        // 3. Fetch Processed Count (letters processed by Supervisor - step 1)
        const processedRes = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications?mode=processed&currentStep=1&limit=1`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );
        const processedJson = await processedRes.json();
        const processedCount = processedJson.meta?.total || 0;

        // 4. Fetch Recent Letters for table (all SRB letters relevant to this step)
        const query = new URLSearchParams({
            // Show all SRB letters in the global table
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
                actionRequired: pendingCount,
                completedMonth: processedCount, // Use processed count for "Selesai" card
                totalMonth: statsData.totalCreatedThisMonth || 0,
                trend: statsData.trend,
                distribution: statsData.distribution,
            },
            recentLetters: appsData.map((app: ApplicationSummary) => {
                // Determine target and status based on currentStep
                let target = "Selesai";
                if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
                    const stepToRole: Record<number, string> = {
                        1: "Supervisor Akademik",
                        2: "Manajer TU",
                        3: "Wakil Dekan 1",
                        4: "UPA",
                    };
                    target = stepToRole[app.currentStep] || "Diproses";
                }

                return {
                    id: app.id,
                    applicant:
                        app.applicantName || app.formData?.namaLengkap || "N/A",
                    subject:
                        app.scholarshipName || "Surat Rekomendasi Beasiswa",
                    date: new Date(app.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    }),
                    target,
                    status:
                        app.status === "PENDING" || app.currentStep === 1
                            ? "Perlu Tindakan"
                            : app.status === "COMPLETED"
                              ? "Selesai"
                              : app.status === "REJECTED"
                                ? "Ditolak"
                                : "Proses",
                    statusColor:
                        app.status === "PENDING" || app.currentStep === 1
                            ? "bg-amber-500"
                            : app.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : app.status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-undip-blue",
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
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
}

export default async function SupervisorAkademikPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const searchParams = await props.searchParams;
    const data = await getDashboardData(searchParams);

    return (
        <AdminDashboard
            roleName="Supervisor Akademik"
            rolePath="supervisor-akademik"
            title="Dashboard Persuratan"
            description="Pusat kendali untuk mengelola semua surat Fakultas Sains dan Matematika."
            stats={data.stats}
            recentLetters={data.recentLetters}
            meta={data.meta}
            detailBasePath="surat-rekomendasi-beasiswa"
        />
    );
}
