import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, User, MessageSquare } from "lucide-react";

interface DetailRevisiProps {
    checker: string;
    comment: string;
    revisionDate?: string;
}

export function DetailRevisi({
    checker,
    comment,
    revisionDate,
}: DetailRevisiProps) {
    return (
        <Card className="shadow-md border-2 border-orange-200 overflow-hidden bg-linear-to-r from-orange-50 to-amber-50">
            <CardHeader className="px-6 py-4 border-b-2 border-orange-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                            Permintaan Revisi
                        </CardTitle>
                        {revisionDate && (
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(revisionDate).toLocaleDateString(
                                    "id-ID",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    },
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <User className="h-5 w-5 text-slate-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">
                                Diminta Oleh
                            </span>
                            <span className="text-sm font-bold text-slate-800 block">
                                {checker}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                        <MessageSquare className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-orange-700 uppercase tracking-wide block mb-2">
                                Komentar Revisi
                            </span>
                            <p className="text-sm font-semibold text-orange-900 leading-relaxed whitespace-pre-wrap">
                                {comment}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        <span className="font-semibold">💡 Petunjuk:</span>{" "}
                        Silakan perbaiki pengajuan Anda sesuai dengan komentar
                        revisi di atas, kemudian klik tombol{" "}
                        <span className="font-bold">Perbaiki Pengajuan</span>{" "}
                        untuk melanjutkan.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
