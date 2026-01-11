import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TimelineItemProps {
  role: string;
  status: string;
  date: string;
  time: string;
  catatan?: string;
  isLast?: boolean;
}

function TimelineItem({ role, status, date, time, catatan, isLast }: TimelineItemProps) {
  const getBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "diajukan":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "disetujui":
      case "verifikasi supervisor akademik":
        return "bg-green-100 text-green-700 border-green-200";
      case "ditolak":
        return "bg-red-100 text-red-700 border-red-200";
      case "menunggu":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex gap-4 relative pb-6">
      {!isLast && (
        <div className="absolute left-2 top-8 w-0.5 h-full bg-gray-200" />
      )}

      <div className="relative shrink-0">
        <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md z-10" />
      </div>

      <div className="flex-1 -mt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-800">{role}</span>
        </div>
        
        <div className="mb-2">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-1">
          {date} • {time}
        </p>

        {catatan && (
          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Catatan:</span> {catatan}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface RiwayatSuratProps {
  riwayat?: Array<{
    role: string;
    status: string;
    date: string;
    time: string;
    catatan?: string;
  }>;
}

export function RiwayatSurat({ riwayat }: RiwayatSuratProps) {
  const timeline = riwayat || [
    {
      role: "Admin Surat",
      status: "Diajukan",
      date: "06 November 2021",
      time: "09:43:48",
      catatan: undefined,
    },
    {
      role: "Supervisor Akademik",
      status: "Verifikasi Supervisor Akademik",
      date: "05 November 2021",
      time: "07:12:34",
      catatan: "Sudah diverifikasi oleh Supervisor Akademik",
    },
    {
      role: "Supervisor Akademik",
      status: "Disetujui",
      date: "05 November 2021",
      time: "07:12:34",
      catatan: undefined,
    },
    {
      role: "Mahasiswa",
      status: "Diajukan",
      date: "04 November 2021",
      time: "14:58:12",
      catatan: undefined,
    },
  ];

  return (
    <Card className="border-none shadow-sm bg-white h-fit">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base font-bold text-gray-800">
          Riwayat Surat <span className="text-blue-600">({timeline.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-0">
          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              role={item.role}
              status={item.status}
              date={item.date}
              time={item.time}
              catatan={item.catatan}
              isLast={index === timeline.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
