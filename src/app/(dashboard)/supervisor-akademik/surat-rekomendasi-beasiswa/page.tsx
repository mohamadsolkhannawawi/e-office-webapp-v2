import { headers } from "next/headers";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import type { ApplicationSummary } from "@/lib/application-api";

// Helper to fetch applications with step filter
async function getSupervisorApplications() {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");

        // Step 1 = Supervisor
        const res = await fetch(
            "http://localhost:3005/api/surat-rekomendasi/applications?currentStep=1",
            {
                headers: {
                    Cookie: cookie || "",
                },
                cache: "no-store",
            },
        );

        if (!res.ok) {
            console.error("Failed to fetch applications:", res.status);
            return [];
        }

        const json = await res.json();
        return json.data || [];
    } catch (err) {
        console.error("Error fetching applications:", err);
        return [];
    }
}

export default async function SupervisorSRBPage() {
    const applications = await getSupervisorApplications();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/supervisor-akademik">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Surat Rekomendasi Beasiswa
                        </h1>
                        <p className="text-muted-foreground">
                            Daftar pengajuan surat rekomendasi yang perlu
                            ditinjau.
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengajuan Masuk</CardTitle>
                    <CardDescription>
                        Total {applications.length} surat menunggu persetujuan
                        Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Mahasiswa</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead>Beasiswa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        Tidak ada berkas yang perlu diproses
                                        saat ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map((app: ApplicationSummary) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            {new Date(
                                                app.createdAt,
                                            ).toLocaleDateString("id-ID")}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {app.createdBy?.mahasiswa?.user
                                                ?.name ||
                                                app.formData?.namaLengkap ||
                                                "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {app.createdBy?.mahasiswa?.nim ||
                                                app.formData?.nim ||
                                                "-"}
                                        </TableCell>
                                        <TableCell>
                                            {app.scholarshipName ||
                                                app.formData?.namaBeasiswa ||
                                                "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                            >
                                                <Clock className="w-3 h-3 mr-1" />
                                                Menunggu Review
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/supervisor-akademik/surat-rekomendasi-beasiswa/${app.id}`}
                                            >
                                                <Button size="sm">
                                                    Periksa
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
