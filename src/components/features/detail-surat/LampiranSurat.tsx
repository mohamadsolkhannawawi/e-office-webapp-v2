"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FilePreview, FilePreviewItem } from "@/components/features/common/FilePreview";

interface LampiranSuratProps {
  files?: Array<{
    name: string;
    type: string;
    size?: string | number;
    url?: string;
  }>;
}

export function LampiranSurat({ files }: LampiranSuratProps) {
  const lampiran = files || [
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

  // Convert to FilePreviewItem format
  const previewFiles: FilePreviewItem[] = lampiran.map((file) => ({
    name: file.name,
    type: file.type,
    size: typeof file.size === "string" ? parseInt(file.size) : file.size,
    url: file.url,
  }));

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base font-bold text-gray-800">
          Lampiran
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <FilePreview 
          files={previewFiles} 
          showPreviewByDefault={true}
          readonly={true}
        />
      </CardContent>
    </Card>
  );
}
