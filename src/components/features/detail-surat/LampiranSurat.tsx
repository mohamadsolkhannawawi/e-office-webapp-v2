"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FilePreview,
    FilePreviewItem,
} from "@/components/features/common/FilePreview";

interface LampiranSuratProps {
    data?: Array<{
        name: string;
        type: string;
        size?: string | number;
        url?: string;
        downloadUrl?: string;
    }>;
}

export function LampiranSurat({ data }: LampiranSuratProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>("Semua");
    
    const lampiran = data || [
        {
            name: "File Proposal.pdf",
            type: "application/pdf",
            size: 2411724, // 2.3 MB in bytes
            url: "/sample-files/proposal.pdf", // URL sample
        },
        {
            name: "KTM.jpg",
            type: "image/jpeg",
            size: 1153434, // 1.1 MB in bytes
            url: "/sample-files/ktm.jpg", // URL sample
        },
    ];

    // Infer category from file type
    const inferCategory = (file: { name: string; type: string }) => {
        const t = file.type.toLowerCase();
        const name = file.name.toLowerCase();
        if (t.includes("pdf") || name.endsWith(".pdf")) return "File";
        if (t.includes("image") || name.endsWith(".jpg") || name.endsWith(".png"))
            return "Foto";
        return "Lainnya";
    };

    // Convert to FilePreviewItem format with category
    const previewFiles: (FilePreviewItem & { kategori: string })[] = lampiran.map((file) => ({
        name: file.name,
        type: file.type,
        size: typeof file.size === "string" ? parseInt(file.size) : file.size,
        url: file.downloadUrl || file.url, // Prioritize downloadUrl from MinIO
        kategori: inferCategory(file),
    }));

    // Filter files based on selection
    const filteredFiles = previewFiles.filter((f) =>
        selectedFilter === "Semua" ? true : f.kategori === selectedFilter
    );

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-bold text-gray-800">
                    Lampiran
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-gray-800">
                            Ringkasan Lampiran
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-600">
                                Tampilkan:
                            </div>
                            <Select
                                value={selectedFilter}
                                onValueChange={setSelectedFilter}
                            >
                                <SelectTrigger className="h-9 w-40 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semua">Semua</SelectItem>
                                    <SelectItem value="File">File (PDF)</SelectItem>
                                    <SelectItem value="Foto">Foto (JPG/PNG)</SelectItem>
                                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {previewFiles.length > 0 ? (
                        filteredFiles.length > 0 ? (
                            <FilePreview
                                files={filteredFiles}
                                showPreviewByDefault={true}
                                readonly={true}
                            />
                        ) : (
                            <div className="text-sm text-gray-500">
                                {selectedFilter === "File"
                                    ? "Tidak ada Lampiran File"
                                    : selectedFilter === "Foto"
                                    ? "Tidak ada Lampiran Foto"
                                    : selectedFilter === "Lainnya"
                                    ? "Tidak ada Lampiran Lainnya"
                                    : "Tidak ada lampiran"}
                            </div>
                        )
                    ) : (
                        <div className="text-sm text-gray-500">
                            Tidak ada lampiran yang tersedia
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
