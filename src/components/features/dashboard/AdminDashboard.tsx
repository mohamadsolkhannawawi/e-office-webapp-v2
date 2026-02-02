"use client";

import React from "react";
import { Inbox, CheckCircle, BarChart, ChevronRight } from "lucide-react";
import {
    Card,
    CardContent as CardContentUI,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LetterList } from "./LetterList";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    const searchParams = useSearchParams();
    
    // Preserve query parameters when navigating
    const getHrefWithParams = (basePath: string) => {
        if (!basePath) return basePath;
        const params = new URLSearchParams(searchParams.toString());
        const queryString = params.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    };
    
    const CardContent = (
        <Card className="border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
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
        return <Link href={getHrefWithParams(href)}>{CardContent}</Link>;
    }

    return CardContent;
}

interface Letter {
    id: string | number;
    applicant: string;
    subject: string;
    date: string;
    target: string;
    status: string;
    statusColor: string;
}

interface AdminDashboardProps {
    roleName: string;
    rolePath: string;
    title: string;
    description: string;
    stats?: {
        actionRequired: number;
        completedMonth: number;
        totalMonth: number;
        trend?: { date: string; count: number }[];
        distribution?: {
            pending: number;
            inProgress: number;
            revision?: number;
            completed: number;
            rejected: number;
        };
    };
    recentLetters?: Letter[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    detailBasePath?: string;
}

export function AdminDashboard({
    roleName,
    rolePath,
    title,
    description,
    stats = {
        actionRequired: 0,
        completedMonth: 0,
        totalMonth: 0,
        trend: [],
        distribution: { pending: 0, inProgress: 0, completed: 0, rejected: 0 },
    },
    recentLetters = [],
    meta,
    detailBasePath = "perlu-tindakan",
}: AdminDashboardProps) {
    // Helper for Trend Chart
    const trendData = (stats.trend || []).map((d) => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        }),
    }));

    // Helper for Distribution
    const dist = stats.distribution || {
        pending: 0,
        inProgress: 0,
        revision: 0,
        completed: 0,
        rejected: 0,
    };

    const pieData = [
        {
            name: "Proses",
            value:
                (dist.pending || 0) +
                (dist.inProgress || 0) +
                (dist.revision || 0),
            color: "#94a3b8",
        }, // slate-400
        { name: "Selesai", value: dist.completed || 0, color: "#10b981" }, // emerald-500
        { name: "Ditolak", value: dist.rejected || 0, color: "#ef4444" }, // red-500
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link
                    href={`/${rolePath}`}
                    className="hover:text-undip-blue transition-colors"
                >
                    Dashboard
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">Dashboard Persuratan</span>
            </nav>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {title}
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Perlu Tindakan"
                    value={stats.actionRequired.toLocaleString("id-ID")}
                    subtext="surat belum diproses"
                    icon={<Inbox />}
                    colorClass="text-undip-blue"
                    iconBgClass="bg-blue-50"
                    href={`/${rolePath}/surat/perlu-tindakan`}
                />
                <StatCard
                    label="Selesai (Bulan Ini)"
                    value={stats.completedMonth.toLocaleString("id-ID")}
                    subtext="surat telah dikerjakan"
                    icon={<CheckCircle />}
                    colorClass="text-emerald-500"
                    iconBgClass="bg-emerald-50"
                    href={`/${rolePath}/surat/selesai`}
                />
                <StatCard
                    label="Total Surat (Bulan Ini)"
                    value={stats.totalMonth.toLocaleString("id-ID")}
                    subtext="total volume bulan ini"
                    icon={<BarChart />}
                    colorClass="text-sky-500"
                    iconBgClass="bg-sky-50"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-800">
                            Tren Volume 30 Hari
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
                                        name="Volume Surat"
                                        fill="#0073B7"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContentUI>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base font-bold text-slate-800">
                            Distribusi Status
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

            {/* Table Section */}
            <LetterList
                title="Semua Surat"
                letters={recentLetters}
                rolePath={roleName.toLowerCase().replace(/ /g, "-")}
                detailBasePath={detailBasePath}
                meta={meta}
            />
        </div>
    );
}
