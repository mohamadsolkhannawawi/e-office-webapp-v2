"use client";

import React from "react";
import { Inbox, CheckCircle, BarChart, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LetterList } from "./LetterList";

interface StatCardProps {
    label: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
    colorClass: string;
    iconBgClass: string;
}

function StatCard({
    label,
    value,
    subtext,
    icon,
    colorClass,
    iconBgClass,
}: StatCardProps) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
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
            </CardContent>
        </Card>
    );
}

interface AdminDashboardProps {
    roleName: string;
    title: string;
    description: string;
}

export function AdminDashboard({
    roleName,
    title,
    description,
}: AdminDashboardProps) {
    const getNextTarget = (role: string) => {
        switch (role) {
            case "Supervisor Akademik":
                return "Manajer TU";
            case "Manajer TU":
                return "Wakil Dekan 1";
            case "Wakil Dekan 1":
                return "UPA";
            case "UPA":
                return "Selesai";
            default:
                return "Manajer TU";
        }
    };

    const letters = [
        {
            id: 1,
            applicant: "Ahmad Syaifullah",
            subject: "Surat Rekomendasi Beasiswa",
            date: "14 Agu 2023",
            target: getNextTarget(roleName),
            status: "Menunggu Verifikasi",
            statusColor: "bg-amber-500",
        },
        {
            id: 2,
            applicant: "Heru Budiman",
            subject: "Surat Rekomendasi Beasiswa",
            date: "14 Agu 2023",
            target: getNextTarget(roleName),
            status: "Menunggu Verifikasi",
            statusColor: "bg-amber-500",
        },
        {
            id: 3,
            applicant: "Maxwell Santosso",
            subject: "Surat Rekomendasi Beasiswa",
            date: "12 Agu 2023",
            target: getNextTarget(roleName),
            status: "Menunggu Verifikasi",
            statusColor: "bg-amber-500",
        },
        {
            id: 4,
            applicant: "Budi Pekerti",
            subject: "Surat Rekomendasi Beasiswa",
            date: "11 Agu 2023",
            target: getNextTarget(roleName),
            status: "Ditolak",
            statusColor: "bg-red-500",
        },
        {
            id: 5,
            applicant: "Solkhan",
            subject: "Surat Rekomendasi Beasiswa",
            date: "10 Agu 2023",
            target: getNextTarget(roleName),
            status: "Menunggu Verifikasi",
            statusColor: "bg-amber-500",
        },
    ];

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
                    value="20"
                    subtext="surat belum diproses"
                    icon={<Inbox />}
                    colorClass="text-undip-blue"
                    iconBgClass="bg-blue-50"
                />
                <StatCard
                    label="Selesai (Bulan Ini)"
                    value="1,100"
                    subtext="surat telah diarsipkan"
                    icon={<CheckCircle />}
                    colorClass="text-emerald-500"
                    iconBgClass="bg-emerald-50"
                />
                <StatCard
                    label="Total Surat (Bulan Ini)"
                    value="1,234"
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
                    <CardContent>
                        <div className="relative h-48 w-full mt-4">
                            {/* Simple Visual Placeholder for Chart */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[75, 50, 25, 0].map((val) => (
                                    <div
                                        key={val}
                                        className="flex items-center gap-4 w-full"
                                    >
                                        <span className="text-[10px] text-slate-400 w-4 text-right">
                                            {val}
                                        </span>
                                        <div className="flex-1 border-t border-dashed border-slate-100"></div>
                                    </div>
                                ))}
                            </div>
                            <svg
                                className="absolute inset-0 pl-8 overflow-visible"
                                preserveAspectRatio="none"
                                viewBox="0 0 400 150"
                            >
                                <path
                                    d="M0,120 C50,120 80,60 150,50 C220,40 280,80 320,70 C360,60 380,40 400,30"
                                    fill="none"
                                    stroke="#0073B7"
                                    strokeLinecap="round"
                                    strokeWidth="3"
                                    className="drop-shadow-sm"
                                />
                                {[40, 150, 280, 400].map((x, i) => {
                                    const y = [120, 50, 75, 30][i];
                                    return (
                                        <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            fill="#0073B7"
                                            r="4"
                                            className="stroke-white stroke-2"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute bottom-[-30px] left-8 right-0 flex justify-between text-[10px] text-slate-400 px-1 font-medium">
                                <span>1-7</span>
                                <span>8-15</span>
                                <span>16-23</span>
                                <span>24-30</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-800">
                            Distribusi Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-10 flex flex-col justify-center h-full">
                        <div className="flex items-end justify-between px-1 mb-2">
                            <span className="text-xs font-bold text-slate-500">
                                10
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                2
                            </span>
                        </div>
                        <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-100 mb-6">
                            <div
                                className="bg-slate-400 w-5/6 h-full transition-all"
                                title="Menunggu Verifikasi"
                            ></div>
                            <div
                                className="bg-red-500 w-1/6 h-full transition-all"
                                title="Ditolak"
                            ></div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                Menunggu Verifikasi
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                Ditolak
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Section */}
            <LetterList
                title="Semua Surat"
                letters={letters}
                rolePath={roleName.toLowerCase().replace(/ /g, "-")}
                detailBasePath="perlu-tindakan"
            />
        </div>
    );
}
