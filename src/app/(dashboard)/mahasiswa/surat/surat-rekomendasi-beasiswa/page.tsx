import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    GraduationCap,
    Award,
    BookOpen,
    ChevronRight,
} from "lucide-react";

// TODO: Fetch from API
const jenisBeasiswa = [
    {
        id: "internal",
        name: "Beasiswa Internal",
        description: "Beasiswa dari universitas untuk mahasiswa berprestasi",
        icon: GraduationCap,
    },
    {
        id: "external",
        name: "Beasiswa External",
        description: "Beasiswa dari pihak luar seperti pemerintah, swasta, dll",
        icon: Award,
    },
    {
        id: "akademik",
        name: "Beasiswa Akademik",
        description: "Beasiswa berdasarkan prestasi akademik",
        icon: BookOpen,
    },
];

export default function SuratRekomendasiBeasiswaPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500 mb-4">
                <Link
                    href="/mahasiswa"
                    className="hover:text-undip-blue transition-colors"
                >
                    Dashboard
                </Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="text-slate-800">
                    Surat Rekomendasi Beasiswa
                </span>
            </nav>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="order-2 sm:order-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Surat Rekomendasi Beasiswa
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Pilih jenis beasiswa yang ingin Anda ajukan
                    </p>
                </div>
                <Link href="/mahasiswa" className="order-1 sm:order-2 self-start sm:self-auto">
                    <Button className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md inline-flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-semibold">Kembali</span>
                    </Button>
                </Link>
            </div>

            {/* Jenis Beasiswa Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jenisBeasiswa.map((jenis) => {
                    const Icon = jenis.icon;
                    return (
                        <Link
                            key={jenis.id}
                            href={`/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis.id}`}
                        >
                            <Card className="cursor-pointer hover:bg-slate-50 hover:border-primary transition-all h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">
                                            {jenis.name}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        {jenis.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
