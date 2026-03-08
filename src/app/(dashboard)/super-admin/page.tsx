import { headers } from "next/headers";
import { SuperAdminDashboard } from "@/components/features/dashboard";

export const dynamic = "force-dynamic";

async function getDashboardData() {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        console.log("[Dashboard] Cookie present:", !!cookie);

        if (!cookie) {
            console.log("[Dashboard] No cookie found - user not logged in");
            return {
                stats: {
                    totalUsers: 0,
                    activeUsers: 0,
                    totalRoles: 0,
                    totalDepartments: 0,
                    totalProdi: 0,
                    storageUsed: 0,
                    usersByRole: [],
                    userTrend: [],
                },
                recentActivities: [],
            };
        }

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        console.log(
            "[Dashboard] Fetching stats from:",
            `${apiUrl}/api/admin/system/stats`,
        );

        // Fetch system stats
        const statsRes = await fetch(`${apiUrl}/api/admin/system/stats`, {
            headers: { Cookie: cookie || "" },
            cache: "no-store",
        });

        if (!statsRes.ok) {
            const errorText = await statsRes.text();
            console.error("Stats API Error:", {
                status: statsRes.status,
                statusText: statsRes.statusText,
                body: errorText,
            });

            // If 401/403, return empty data (permission issue)
            if (statsRes.status === 401 || statsRes.status === 403) {
                console.log(
                    "[Dashboard] Permission denied - returning empty stats",
                );
                return {
                    stats: {
                        totalUsers: 0,
                        activeUsers: 0,
                        totalRoles: 0,
                        totalDepartments: 0,
                        totalProdi: 0,
                        storageUsed: 0,
                        usersByRole: [],
                        userTrend: [],
                    },
                    recentActivities: [],
                };
            }

            throw new Error(
                `Failed to fetch system stats: ${statsRes.status} ${statsRes.statusText}`,
            );
        }

        const statsData = await statsRes.json();
        console.log("Stats data received:", statsData);

        // Fetch recent audit logs to show as "recent activities"
        const logsRes = await fetch(
            `${apiUrl}/api/admin/system/audit-logs?limit=10`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );

        const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };

        return {
            stats: {
                totalUsers: statsData.totalUsers || 0,
                activeUsers: statsData.activeUsers || 0,
                totalRoles: statsData.totalRoles || 0,
                totalDepartments: statsData.totalDepartments || 0,
                totalProdi: statsData.totalProdi || 0,
                storageUsed: statsData.storageUsed || 0,
                usersByRole: statsData.usersByRole || [],
                userTrend: statsData.userTrend || [],
            },
            recentActivities: logsData.logs || [],
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            stats: {
                totalUsers: 0,
                activeUsers: 0,
                totalRoles: 0,
                totalDepartments: 0,
                totalProdi: 0,
                storageUsed: 0,
                usersByRole: [],
                userTrend: [],
            },
            recentActivities: [],
        };
    }
}

export default async function SuperAdminDashboardPage() {
    const { stats, recentActivities } = await getDashboardData();

    return (
        <SuperAdminDashboard
            stats={stats}
            recentActivities={recentActivities}
        />
    );
}
