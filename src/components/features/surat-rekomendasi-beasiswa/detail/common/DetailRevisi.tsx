import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, User, MessageSquare } from "lucide-react";

interface DetailRevisiProps {
    checker: string;
    comment: string;
    revisionDate?: string;
    title?: string; // Judul revisi (misal: Revisi SPV ke MHS 3)
}

export function DetailRevisi({
    checker,
    comment,
    revisionDate,
}: DetailRevisiProps) {
    return (
        <Card className="border-orange-300 bg-orange-50/80 px-4 py-2 rounded-lg flex flex-col gap-2 shadow-none">
            <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-bold text-orange-800 text-base">
                    Permintaan Revisi
                </span>
                {revisionDate && (
                    <span className="text-xs text-slate-500 ml-2">
                        {new Date(revisionDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-slate-700">{checker}</span>
                <span className="mx-2 text-slate-400">|</span>
                <MessageSquare className="h-4 w-4 text-orange-600" />
                <span className="text-orange-900 font-medium whitespace-pre-wrap">
                    {comment}
                </span>
            </div>
            <div className="text-xs text-blue-800 mt-1">
                Perbaiki pengajuan sesuai komentar di atas, dengan klik tombol
                {" "}
                <span className="font-bold">Revisi</span>.
            </div>
        </Card>
    );
}
