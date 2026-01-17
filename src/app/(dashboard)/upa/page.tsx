import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Users, TrendingUp, Settings } from "lucide-react";

export default function UPADashboardPage() {
    // TODO: Fetch actual data from API
    const stats = {
        activeScholarships: 12,
        totalApplicants: 156,
        approvalRate: "78",
        pendingConfiguration: 2,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard UPA
                </h1>
                <p className="text-muted-foreground">
                    Manajemen beasiswa dan laporan pengajuan
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Beasiswa Aktif
                        </CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.activeScholarships}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Jenis beasiswa
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pelamar
                        </CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalApplicants}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Semester ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tingkat Approval
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.approvalRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tingkat keberhasilan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Perlu Konfigurasi
                        </CardTitle>
                        <Settings className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pendingConfiguration}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Beasiswa baru
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Management & Reports */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Manajemen Beasiswa</CardTitle>
                        <CardDescription>
                            Kelola jenis beasiswa yang tersedia
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                            Fitur akan segera tersedia
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Laporan Pengajuan</CardTitle>
                        <CardDescription>
                            Statistik dan analisis pengajuan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                            Fitur akan segera tersedia
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
