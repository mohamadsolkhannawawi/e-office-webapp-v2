import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function MahasiswaDashboardPage() {
    // TODO: Fetch actual data from API
    const stats = {
        total: 5,
        pending: 2,
        approved: 2,
        rejected: 1,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard Mahasiswa
                </h1>
                <p className="text-muted-foreground">
                    Kelola pengajuan surat rekomendasi beasiswa Anda
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pengajuan
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Menunggu
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pending}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Disetujui
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.approved}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ditolak
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.rejected}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                    <CardDescription>
                        Pilih jenis surat untuk mengajukan
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Link href="/mahasiswa/surat-rekomendasi-beasiswa">
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Surat Rekomendasi Beasiswa
                                </CardTitle>
                                <CardDescription>
                                    Ajukan surat rekomendasi untuk beasiswa
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    {/* TODO: Add more letter types here */}
                </CardContent>
            </Card>
        </div>
    );
}
