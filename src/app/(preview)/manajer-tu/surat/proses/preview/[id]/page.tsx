import { headers } from "next/headers";
import { SuratPreviewContent } from "@/components/features/surat-rekomendasi-beasiswa/preview/SuratPreviewContent";
import { mapApplicationToPreviewData } from "@/utils/preview-mapper";
import { ApplicationDetail } from "@/lib/application-api";

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
        return json.data as ApplicationDetail;
    } catch (error) {
        console.error("Fetch application error:", error);
        return null;
    }
}

export default async function ManajerTUPreviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ stage?: string; no?: string }>;
}) {
    const { id } = await params;
    const { stage, no } = await searchParams;
    const application = await getApplication(id);

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 animate-in fade-in duration-500">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center max-w-md mx-auto">
                    <p className="font-bold text-xl text-slate-800 mb-2">
                        Data Tidak Ditemukan
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        Maaf, kami tidak dapat menemukan data surat dengan ID
                        tersebut.
                    </p>
                    <p className="text-xs font-mono bg-slate-200 px-3 py-1 rounded-md inline-block">
                        ID: {id}
                    </p>
                </div>
            </div>
        );
    }

    // Map application data to PreviewData format
    const previewData = mapApplicationToPreviewData(application, { no });

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <SuratPreviewContent
                defaultStage={stage || "manajer"}
                backUrl={`/manajer-tu/surat/surat-rekomendasi-beasiswa/detail/${id}`}
                data={previewData}
                applicationId={id}
            />
        </div>
    );
}
