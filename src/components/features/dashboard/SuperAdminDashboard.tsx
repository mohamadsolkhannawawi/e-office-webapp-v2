"use client";

import React from "react";
import {
    Users,
    UserCheck,
    Shield,
    Database,
    HardDrive,
    Building2,
    Activity,
    User,
    Clock,
    FileCheck,
    AlertCircle,
} from "lucide-react";
import {
    Card,
    CardContent as CardContentUI,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface StatCardProps {
    label: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
    colorClass: string;
    iconBgClass: string;
    href?: string;
}

function StatCard({
    label,
    value,
    subtext,
    icon,
    colorClass,
    iconBgClass,
    href,
}: StatCardProps) {
    const CardContent = (
        <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all hover:-translate-y-1 duration-300 rounded-3xl">
            <CardContentUI className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        {label}
                    </span>
                    <div className={`p-2 rounded-lg ${iconBgClass}`}>
                        {React.cloneElement(
                            icon as React.ReactElement<{ className?: string }>,
                            {
                                className: `h-5 w-5 ${colorClass}`,
                            },
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-4xl font-bold text-slate-800 mb-1">
                        {value}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                        {subtext}
                    </div>
                </div>
            </CardContentUI>
        </Card>
    );

    if (href) {
        return <Link href={href}>{CardContent}</Link>;
    }

    return CardContent;
}

interface Activity {
    id: string;
    action: string;
    note: string | null;
    status: string | null;
    createdAt: string;
    actor: {
        id: string;
        name: string;
        email: string;
    };
    letterInstance: {
        id: string;
        letterNumber: string | null;
        letterType: {
            name: string;
        };
    } | null;
    role: {
        name: string;
    } | null;
}

interface SuperAdminDashboardProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalRoles: number;
        totalDepartments: number;
        totalProdi: number;
        storageUsed: number; // in MB
        usersByRole?: { name: string; count: number }[];
        userTrend?: { date: string; count: number }[];
    };
    recentActivities?: Activity[];
}

export function SuperAdminDashboard({
    stats,
    recentActivities = [],
}: SuperAdminDashboardProps) {
    const { user } = useAuth();

    // Helper for Trend Chart
    const trendData = (stats.userTrend || []).map((d) => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        }),
    }));

    // Helper for Distribution Pie Chart
    const roleColors: Record<string, string> = {
        MAHASISWA: "#0ea5e9", // sky-500
        SUPERVISOR: "#8b5cf6", // violet-500
        MANAJER_TU: "#f59e0b", // amber-500
        WAKIL_DEKAN_1: "#ec4899", // pink-500
        UPA: "#10b981", // emerald-500
        SUPER_ADMIN: "#ef4444", // red-500
    };

    const pieData = (stats.usersByRole || []).map((role) => ({
        name: role.name
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: role.count,
        color: roleColors[role.name] || "#64748b", // slate-500 default
    }));

    // Format storage size
    const formatStorage = (mb: number) => {
        if (mb >= 1024) {
            return `${(mb / 1024).toFixed(2)} GB`;
        }
        return `${mb.toFixed(2)} MB`;
    };

    const formatActionName = (action: string) => {
        const actionMap: Record<string, string> = {
            create: "Dibuat",
            update: "Diperbarui",
            delete: "Dihapus",
            submit: "Diajukan",
            approve: "Disetujui",
            reject: "Ditolak",
            login: "Masuk",
            logout: "Keluar",
            upload: "Diunggah",
            download: "Diunduh",
            view: "Dilihat",
            print: "Dicetak",
            archive: "Diarsipkan",
            restore: "Dipulihkan",
            generate: "Digenerate",
            sign: "Ditandatangani",
            cancel: "Dibatalkan",
            revision: "Revisi",
        };
        return actionMap[action.toLowerCase()] || action;
    };

    const formatStatusName = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: "Menunggu",
            approved: "Disetujui",
            rejected: "Ditolak",
            completed: "Selesai",
            in_progress: "Dalam Proses",
            cancelled: "Dibatalkan",
            draft: "Draft",
            active: "Aktif",
            inactive: "Tidak Aktif",
            archived: "Diarsipkan",
        };
        return statusMap[status.toLowerCase()] || status;
    };

    const formatRoleName = (role: string) => {
        const roleMap: Record<string, string> = {
            MAHASISWA: "Mahasiswa",
            SUPERVISOR_AKADEMIK: "Supervisor Akademik",
            MANAJER_TU: "Manajer TU",
            WAKIL_DEKAN_1: "Wakil Dekan 1",
            UPA: "UPA",
            SUPER_ADMIN: "Super Admin",
        };
        const normalizedRole = role.toUpperCase();
        return roleMap[normalizedRole] || role;
    };

    const getActionBadgeColor = (action: string) => {
        const actionLower = action.toLowerCase();
        if (
            actionLower.includes("create") ||
            actionLower.includes("submit") ||
            actionLower.includes("generate")
        )
            return "bg-green-100 text-green-700 border-green-200";
        if (actionLower.includes("approve") || actionLower.includes("sign"))
            return "bg-blue-100 text-blue-700 border-blue-200";
        if (
            actionLower.includes("reject") ||
            actionLower.includes("cancel") ||
            actionLower.includes("delete")
        )
            return "bg-red-100 text-red-700 border-red-200";
        if (
            actionLower.includes("edit") ||
            actionLower.includes("update") ||
            actionLower.includes("revision")
        )
            return "bg-amber-100 text-amber-700 border-amber-200";
        return "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getStatusBadgeColor = (status: string | null) => {
        if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
        const statusLower = status.toLowerCase();
        if (
            statusLower.includes("approve") ||
            statusLower.includes("complet") ||
            statusLower.includes("active")
        )
            return "bg-green-100 text-green-700 border-green-200";
        if (
            statusLower.includes("reject") ||
            statusLower.includes("cancel") ||
            statusLower.includes("inactive")
        )
            return "bg-red-100 text-red-700 border-red-200";
        if (
            statusLower.includes("pending") ||
            statusLower.includes("process") ||
            statusLower.includes("draft")
        )
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-gray-100 text-gray-700 border-gray-200";
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm", {
                locale: localeId,
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Dashboard Super Admin
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                    {user?.name ? (
                        <>
                            Selamat datang{" "}
                            <span className="text-undip-blue font-bold">
                                {user.name}
                            </span>
                            , pantau dan kelola seluruh sistem E-Office FSM
                            UNDIP dari sini.
                        </>
                    ) : (
                        "Pantau dan kelola seluruh sistem E-Office FSM UNDIP"
                    )}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Pengguna"
                    value={stats.totalUsers.toLocaleString("id-ID")}
                    subtext="pengguna terdaftar"
                    icon={<Users />}
                    colorClass="text-undip-blue"
                    iconBgClass="bg-blue-50"
                    href="/super-admin/kelola-pengguna"
                />
                <StatCard
                    label="Pengguna Aktif"
                    value={stats.activeUsers.toLocaleString("id-ID")}
                    subtext="akun terverifikasi"
                    icon={<UserCheck />}
                    colorClass="text-emerald-500"
                    iconBgClass="bg-emerald-50"
                    href="/super-admin/kelola-pengguna?status=active"
                />
                <StatCard
                    label="Total Role"
                    value={stats.totalRoles.toLocaleString("id-ID")}
                    subtext="role dalam sistem"
                    icon={<Shield />}
                    colorClass="text-violet-500"
                    iconBgClass="bg-violet-50"
                    href="/super-admin/kelola-peran"
                />
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Departemen"
                    value={stats.totalDepartments.toLocaleString("id-ID")}
                    subtext="departemen terdaftar"
                    icon={<Building2 />}
                    colorClass="text-sky-500"
                    iconBgClass="bg-sky-50"
                    href="/super-admin/master-data/departemen"
                />
                <StatCard
                    label="Program Studi"
                    value={stats.totalProdi.toLocaleString("id-ID")}
                    subtext="program studi aktif"
                    icon={<Database />}
                    colorClass="text-amber-500"
                    iconBgClass="bg-amber-50"
                    href="/super-admin/master-data/prodi"
                />
                <StatCard
                    label="Storage Terpakai"
                    value={formatStorage(stats.storageUsed)}
                    subtext="total file di-upload"
                    icon={<HardDrive />}
                    colorClass="text-pink-500"
                    iconBgClass="bg-pink-50"
                    href="/super-admin/manajemen-dokumen"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden rounded-3xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-800">
                            Tren Registrasi Pengguna (30 Hari)
                        </CardTitle>
                    </CardHeader>
                    <CardContentUI>
                        <div className="h-64 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={trendData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="displayDate"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#f8fafc" }}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow:
                                                "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Pengguna Baru"
                                        fill="#0073B7"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContentUI>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden rounded-3xl">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base font-bold text-slate-800">
                            Distribusi Pengguna
                        </CardTitle>
                    </CardHeader>
                    <CardContentUI className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow:
                                            "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                        fontSize: "12px",
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContentUI>
                </Card>
            </div>

            {/* Recent Activities Section */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden rounded-3xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800">
                            Aktivitas Terbaru
                        </CardTitle>
                        <div className="text-sm text-slate-500">
                            Menampilkan {recentActivities.length} aktivitas
                            terakhir
                        </div>
                    </div>
                </CardHeader>
                <CardContentUI>
                    <div className="space-y-4">
                        {recentActivities.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">
                                Belum ada aktivitas sistem
                            </p>
                        ) : (
                            recentActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="rounded-full bg-undip-blue/10 p-2 mt-1">
                                                <Activity className="h-4 w-4 text-undip-blue" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="outline"
                                                        className={getActionBadgeColor(
                                                            activity.action,
                                                        )}
                                                    >
                                                        {formatActionName(
                                                            activity.action,
                                                        )}
                                                    </Badge>
                                                    {activity.status && (
                                                        <Badge
                                                            variant="outline"
                                                            className={getStatusBadgeColor(
                                                                activity.status,
                                                            )}
                                                        >
                                                            {formatStatusName(
                                                                activity.status,
                                                            )}
                                                        </Badge>
                                                    )}
                                                    {activity.role && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-purple-50 text-purple-700 border-purple-200"
                                                        >
                                                            {formatRoleName(
                                                                activity.role
                                                                    .name,
                                                            )}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="font-medium text-slate-700">
                                                            {activity.actor
                                                                ?.name ||
                                                                "Sistem"}
                                                        </span>
                                                        {activity.actor
                                                            ?.email && (
                                                            <>
                                                                <span className="text-slate-400">
                                                                    •
                                                                </span>
                                                                <span className="text-slate-500">
                                                                    {
                                                                        activity
                                                                            .actor
                                                                            .email
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {activity.letterInstance && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="text-slate-600">
                                                                {
                                                                    activity
                                                                        .letterInstance
                                                                        .letterType
                                                                        .name
                                                                }
                                                            </span>
                                                            {activity
                                                                .letterInstance
                                                                .letterNumber && (
                                                                <>
                                                                    <span className="text-slate-400">
                                                                        •
                                                                    </span>
                                                                    <span className="font-mono text-slate-500">
                                                                        {
                                                                            activity
                                                                                .letterInstance
                                                                                .letterNumber
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {activity.note && (
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <AlertCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                                                            <span className="text-slate-600 italic">
                                                                {activity.note}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="whitespace-nowrap">
                                                {formatDate(activity.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContentUI>
            </Card>
        </div>
    );
}
