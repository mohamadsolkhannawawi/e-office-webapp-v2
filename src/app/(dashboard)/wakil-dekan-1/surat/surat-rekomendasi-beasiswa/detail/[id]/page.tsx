import { headers } from "next/headers";
import { AdminDetailSurat } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/AdminDetailSurat";

async function getApplication(id: string) {
    try {
        const headersList = await headers();
        const cookie = headersList.get("cookie");
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

        console.log(
            `[WD1DetailPage] Fetching application: ${apiUrl}/api/surat-rekomendasi/applications/${id}`,
        );
        console.log(`[WD1DetailPage] Has Cookie: ${!!cookie ? "Yes" : "No"}`);

        const res = await fetch(
            `${apiUrl}/api/surat-rekomendasi/applications/${id}`,
            {
                headers: { Cookie: cookie || "" },
                cache: "no-store",
            },
        );

        console.log(
            `[WD1DetailPage] API Response Status: ${res.status} for ID: ${id}`,
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(
                `[WD1DetailPage] API Error ${res.status}: ${res.statusText}`,
            );
            console.error(`[WD1DetailPage] Response body:`, errorText);
            return null;
        }

        const json = await res.json();
        console.log(`[WD1DetailPage] Successfully fetched application: ${id}`);
        return json.data;
    } catch (error) {
        console.error(
            "[WD1DetailPage] Fetch application error:",
            error instanceof Error ? error.message : error,
        );
        return null;
    }
}

export default async function WD1DetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    console.log(`[WD1DetailPage] Rendering page for ID: ${id}`);

    const application = await getApplication(id);

    if (!application) {
        console.warn(`[WD1DetailPage] No application data found for ID: ${id}`);
        return (
            <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                <p className="font-bold text-lg mb-2">
                    Data tidak ditemukan atau error memuat data.
                </p>
                <p className="text-sm">ID: {id}</p>
                <p className="text-xs mt-4 text-slate-400">
                    Cek network tab atau server logs untuk detail error.
                </p>
            </div>
        );
    }

    console.log(`[WD1DetailPage] Rendering AdminDetailSurat for ID: ${id}`);

    return (
        <AdminDetailSurat
            role="wakil-dekan-1"
            id={id}
            initialData={application}
        />
    );
}
