"use client";

import React from "react";
import {
    Search,
    Calendar,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Letter {
    id: string | number;
    applicant: string;
    subject: string;
    date: string;
    target: string;
    status: string;
    statusColor: string;
}

interface LetterListProps {
    title: string;
    letters: Letter[];
    rolePath: string;
    detailBasePath: string;
}

export function LetterList({
    title,
    letters,
    rolePath,
    detailBasePath,
}: LetterListProps) {
    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            className="pl-10 h-10 border-slate-100 bg-slate-50/50"
                            placeholder="Cari surat..."
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="h-10 border-slate-100 text-slate-600 gap-2"
                    >
                        <Calendar className="h-4 w-4" />
                        Rentang Tanggal
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 border-slate-100 text-slate-600 gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Status
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-wider">
                            <th className="px-6 py-4">Pengirim / Pemohon</th>
                            <th className="px-6 py-4">Perihal</th>
                            <th className="px-6 py-4">Tanggal Diterima</th>
                            <th className="px-6 py-4">Tujuan Saat Ini</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {letters.map((letter) => (
                            <tr
                                key={letter.id}
                                className="hover:bg-slate-50/30 transition-colors group"
                            >
                                <td className="px-6 py-4 font-bold text-slate-700">
                                    {letter.applicant}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {letter.subject}
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-medium">
                                    {letter.date}
                                </td>
                                <td className="px-6 py-4 font-bold text-undip-blue">
                                    {letter.target}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${letter.statusColor}`}
                                        ></div>
                                        <span
                                            className={`text-[11px] font-bold uppercase ${letter.statusColor === "bg-red-500" ? "text-red-500" : "text-slate-500"}`}
                                        >
                                            {letter.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Link
                                        href={`/${rolePath}/surat/${detailBasePath}/detail/${letter.id}`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-8 text-xs font-bold border-slate-100 text-slate-600 hover:bg-white hover:border-undip-blue hover:text-undip-blue transition-all gap-1.5 px-4"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Detail
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                    Menampilkan <span className="text-slate-600">1-5</span> dari{" "}
                    <span className="text-slate-600">100</span>
                </p>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button className="h-8 w-8 text-xs font-bold bg-undip-blue">
                        1
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 text-xs font-bold text-slate-600"
                    >
                        2
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 text-xs font-bold text-slate-600"
                    >
                        3
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
