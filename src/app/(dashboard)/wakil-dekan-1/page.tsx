import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckSquare, Clock, FileText, BarChart3 } from "lucide-react";

export default function WakilDekan1DashboardPage() {
    // TODO: Fetch actual data from API
    const stats = {
        pendingApproval: 6,
        approvedToday: 4,
        totalThisMonth: 28,
        averageProcessTime: "2.3",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard Wakil Dekan 1
                </h1>
                <p className="text-muted-foreground">
                    Approval dan monitoring pengajuan surat rekomendasi
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Menunggu Approval
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pendingApproval}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Perlu persetujuan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Disetujui Hari Ini
                        </CardTitle>
                        <CheckSquare className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.approvedToday}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pengajuan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Bulan Ini
                        </CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalThisMonth}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pengajuan diproses
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rata-rata Waktu
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.averageProcessTime} hari
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Waktu proses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Approval Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Antrean Persetujuan</CardTitle>
                    <CardDescription>
                        Daftar pengajuan yang menunggu persetujuan Anda
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
