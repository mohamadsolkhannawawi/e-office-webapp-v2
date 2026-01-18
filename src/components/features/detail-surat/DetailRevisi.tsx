import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DetailRevisiProps {
    checker: string;
    comment: string;
}

export function DetailRevisi({ checker, comment }: DetailRevisiProps) {
    return (
        <Card className="shadow-sm border border-gray-100 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-bold text-slate-800">
                    Detail Revisi
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-slate-500">
                        Pengecek
                    </span>
                    <span className="md:col-span-2 text-sm font-bold text-slate-800">
                        {checker}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-slate-500">
                        Komentar Revisi
                    </span>
                    <div className="md:col-span-2 text-sm font-bold text-red-600 bg-red-50 px-3 py-2 rounded border border-red-100">
                        {comment}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
