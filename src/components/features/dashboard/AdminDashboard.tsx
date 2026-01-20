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
        return <Link href={href}>{CardContent}</Link>;
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
}: AdminDashboardProps) {
    // Helper for Trend Chart
    const trendData = stats.trend || [];
    const maxCount = Math.max(...trendData.map((d) => d.count), 5); // Minimum scale 5
    const chartHeight = 100;
    const chartWidth = 400;

    const getPoints = () => {
        if (!trendData.length) return "";
        const stepX = chartWidth / (trendData.length - 1 || 1);
        return trendData
            .map((d, i) => {
                const x = i * stepX;
                const y = chartHeight - (d.count / maxCount) * chartHeight;
                return `${x},${y}`;
            })
            .join(" ");
    };

    const points = getPoints();
    // Beziér curve smoothing could be complex, using polyline for simplicity or smoothed path if needed.
    // Let's stick to simple polyline or basic smooth approximation logic if time fits, but simple polyline is robust.
    const pathD = points ? `M${points.replace(/ /g, " L")}` : "";

    // Helper for Distribution
    const dist = stats.distribution || {
        pending: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
    };
    const totalDist =
        dist.pending + dist.inProgress + dist.completed + dist.rejected || 1;

    const pendingPct = ((dist.pending + dist.inProgress) / totalDist) * 100;
    const completedPct = (dist.completed / totalDist) * 100;
    const rejectedPct = (dist.rejected / totalDist) * 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <span className="hover:text-undip-blue cursor-pointer">
                    Dashboard
                </span>
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
                    subtext="surat telah diarsipkan"
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
                <Card className="lg:col-span-2 border-none shadow-sm pb-10">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-800">
                            Tren Volume 30 Hari
                        </CardTitle>
                    </CardHeader>
                    <CardContentUI>
                        <div className="relative h-48 w-full mt-4">
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[
                                    maxCount,
                                    Math.round(maxCount * 0.66),
                                    Math.round(maxCount * 0.33),
                                    0,
                                ].map((val) => (
                                    <div
                                        key={val}
                                        className="flex items-center gap-4 w-full"
                                    >
                                        <span className="text-[10px] text-slate-400 w-6 text-right">
                                            {val}
                                        </span>
                                        <div className="flex-1 border-t border-dashed border-slate-100"></div>
                                    </div>
                                ))}
                            </div>
                            {/* Chart SVG */}
                            <div className="absolute inset-0 pl-10 pt-2 pb-6 right-2">
                                <svg
                                    className="w-full h-full overflow-visible"
                                    preserveAspectRatio="none"
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                >
                                    {pathD && (
                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke="#0073B7"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            className="drop-shadow-sm"
                                        />
                                    )}
                                </svg>
                            </div>
                            <div className="absolute bottom-[-20px] left-10 right-2 flex justify-between text-[10px] text-slate-400 px-1 font-medium">
                                <span>30 hari lalu</span>
                                <span>Hari ini</span>
                            </div>
                        </div>
                    </CardContentUI>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-800">
                            Distribusi Status
                        </CardTitle>
                    </CardHeader>
                    <CardContentUI className="pt-10 flex flex-col justify-center h-full">
                        <div className="flex items-end justify-between px-1 mb-2">
                            <span className="text-xs font-bold text-slate-500">
                                {dist.pending + dist.inProgress}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                {dist.completed}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                {dist.rejected}
                            </span>
                        </div>
                        <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-100 mb-6">
                            {pendingPct > 0 && (
                                <div
                                    className="bg-slate-400 h-full"
                                    style={{ width: `${pendingPct}%` }}
                                    title="Proses/Pending"
                                ></div>
                            )}
                            {completedPct > 0 && (
                                <div
                                    className="bg-emerald-500 h-full"
                                    style={{ width: `${completedPct}%` }}
                                    title="Selesai"
                                ></div>
                            )}
                            {rejectedPct > 0 && (
                                <div
                                    className="bg-red-500 h-full"
                                    style={{ width: `${rejectedPct}%` }}
                                    title="Ditolak"
                                ></div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                Proses ({Math.round(pendingPct)}%)
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                Selesai ({Math.round(completedPct)}%)
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                Ditolak ({Math.round(rejectedPct)}%)
                            </div>
                        </div>
                    </CardContentUI>
                </Card>
            </div>

            {/* Table Section */}
            <LetterList
                title="Semua Surat"
                letters={recentLetters}
                rolePath={roleName.toLowerCase().replace(/ /g, "-")}
                detailBasePath="perlu-tindakan"
                meta={meta}
            />
        </div>
    );
}
