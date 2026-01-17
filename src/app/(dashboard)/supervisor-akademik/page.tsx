import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function SupervisorAkademikDashboardPage() {
    // TODO: Fetch actual data from API
    const stats = {
        pending: 8,
        inProgress: 3,
        completed: 45,
        needsRevision: 2,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard Supervisor Akademik
                </h1>
                <p className="text-muted-foreground">
                    Verifikasi dan kelola pengajuan surat rekomendasi mahasiswa
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Menunggu Verifikasi
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pending}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Perlu ditinjau
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sedang Diproses
                        </CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.inProgress}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Dalam review
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Selesai Diverifikasi
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.completed}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bulan ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Perlu Revisi
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.needsRevision}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Dikembalikan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for pending verification list */}
            <Card>
                <CardHeader>
                    <CardTitle>Pengajuan Menunggu Verifikasi</CardTitle>
                    <CardDescription>
                        Daftar pengajuan yang perlu ditinjau dan diverifikasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        Fitur akan segera tersedia
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
