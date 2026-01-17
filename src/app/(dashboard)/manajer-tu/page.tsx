import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Inbox, Send, FileCheck, Clock } from "lucide-react";

export default function ManajerTUDashboardPage() {
    // TODO: Fetch actual data from API
    const stats = {
        incoming: 12,
        outgoing: 8,
        processed: 35,
        pending: 5,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard Manajer TU
                </h1>
                <p className="text-muted-foreground">
                    Kelola surat masuk dan surat keluar
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Surat Masuk
                        </CardTitle>
                        <Inbox className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.incoming}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Hari ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Surat Keluar
                        </CardTitle>
                        <Send className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.outgoing}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Hari ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sudah Diproses
                        </CardTitle>
                        <FileCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.processed}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bulan ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Menunggu Proses
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pending}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Perlu ditindak
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for incoming/outgoing sections */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Surat Masuk Terbaru</CardTitle>
                        <CardDescription>
                            Daftar surat masuk yang perlu diproses
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
                        <CardTitle>Surat Keluar Terbaru</CardTitle>
                        <CardDescription>
                            Daftar surat keluar yang telah dikirim
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
