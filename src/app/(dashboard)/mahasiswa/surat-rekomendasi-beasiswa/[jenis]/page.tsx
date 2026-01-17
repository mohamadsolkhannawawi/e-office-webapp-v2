import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    Plus,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageProps {
    params: Promise<{ jenis: string }>;
}

// TODO: Fetch from API based on jenis
const pengajuanList = [
    {
        id: "1",
        scholarshipName: "Beasiswa PPA 2024",
        status: "PENDING",
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        scholarshipName: "Beasiswa Djarum",
        status: "IN_PROGRESS",
        createdAt: "2024-01-10",
    },
];

const statusConfig = {
    PENDING: {
        label: "Menunggu",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
    },
    IN_PROGRESS: {
        label: "Diproses",
        color: "bg-blue-100 text-blue-800",
        icon: FileText,
    },
    COMPLETED: {
        label: "Selesai",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
    },
    REJECTED: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
    },
};

export default async function JenisBeasiswaPage({ params }: PageProps) {
    const { jenis } = await params;
    const jenisLabel = jenis.charAt(0).toUpperCase() + jenis.slice(1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/mahasiswa/surat-rekomendasi-beasiswa">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Beasiswa {jenisLabel}
                        </h1>
                        <p className="text-muted-foreground">
                            Daftar pengajuan surat rekomendasi beasiswa{" "}
                            {jenisLabel.toLowerCase()}
                        </p>
                    </div>
                </div>
                <Link
                    href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}/baru`}
                >
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Pengajuan Baru
                    </Button>
                </Link>
            </div>

            {/* Pengajuan List */}
            <div className="space-y-4">
                {pengajuanList.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Belum ada pengajuan
                            </p>
                            <Link
                                href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}/baru`}
                            >
                                <Button className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Pengajuan Pertama
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    pengajuanList.map((pengajuan) => {
                        const status =
                            statusConfig[
                                pengajuan.status as keyof typeof statusConfig
                            ];
                        const StatusIcon = status.icon;
                        return (
                            <Link
                                key={pengajuan.id}
                                href={`/mahasiswa/surat-rekomendasi-beasiswa/${jenis}/${pengajuan.id}`}
                            >
                                <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                {pengajuan.scholarshipName}
                                            </CardTitle>
                                            <Badge className={status.color}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Diajukan pada{" "}
                                            {new Date(
                                                pengajuan.createdAt
                                            ).toLocaleDateString("id-ID")}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
