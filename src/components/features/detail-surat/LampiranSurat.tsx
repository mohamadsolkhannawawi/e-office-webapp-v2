import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface FileItemProps {
  name: string;
  type: string;
  size?: string;
}

function FileItem({ name, type, size }: FileItemProps) {
  return (
    <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-md mr-3">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
        <p className="text-xs text-gray-500">{type}</p>
        {size && <p className="text-xs text-gray-400 mt-0.5">{size}</p>}
      </div>
    </div>
  );
}

interface LampiranSuratProps {
  files?: Array<{
    name: string;
    type: string;
    size?: string;
  }>;
}

export function LampiranSurat({ files }: LampiranSuratProps) {
  const lampiran = files || [
    {
      name: "File Proposal.pdf",
      type: "PDF Document",
      size: "2.3 MB",
    },
    {
      name: "KTM.jpg",
      type: "Image",
      size: "1.1 MB",
    },
  ];

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base font-bold text-gray-800">
          Lampiran
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {lampiran.map((file, index) => (
            <FileItem
              key={index}
              name={file.name}
              type={file.type}
              size={file.size}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
