import { headers } from "next/headers";
import { AdminDetailSurat } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/AdminDetailSurat";

async function getApplication(id: string) {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        const res = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications/${id}`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );

        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Fetch application error:", error);
        return null;
    }
}

export default async function SupervisorDetailSuratPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { id } = await params;
    const search = await searchParams;
    const from =
        (search.from as "perlu-tindakan" | "selesai" | undefined) || undefined;
    const application = await getApplication(id);

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                <p className="font-bold text-lg">
                    Data tidak ditemukan atau error memuat data.
                </p>
                <p className="text-sm">ID: {id}</p>
            </div>
        );
    }

    return (
        <AdminDetailSurat
            role="supervisor-akademik"
            id={id}
            from={from}
            initialData={application}
        />
    );
}
