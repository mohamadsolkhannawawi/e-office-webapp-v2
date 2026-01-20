import { headers } from "next/headers";
import { SuratPreviewContent } from "@/components/features/surat-rekomendasi-beasiswa/preview/SuratPreviewContent";

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

export default async function SupervisorPreviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const application = await getApplication(id);

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-slate-500">
                <p className="font-bold text-lg">
                    Data tidak ditemukan atau error memuat data.
                </p>
                <p className="text-sm">ID: {id}</p>
            </div>
        );
    }

    // Map application data to preview format
    const previewData = {
        nama: application.formData?.namaLengkap || application.applicantName,
        nim: application.formData?.nim,
        tempatLahir: application.formData?.tempatLahir,
        tanggalLahir: application.formData?.tanggalLahir
            ? new Date(application.formData.tanggalLahir).toLocaleDateString(
                  "id-ID",
                  {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                  },
              )
            : undefined,
        noHp: application.formData?.noHp,
        jurusan: application.formData?.departemen,
        programStudi: application.formData?.programStudi,
        semester: application.formData?.semester,
        ipk: application.formData?.ipk,
        ips: application.formData?.ips,
        keperluan: `Pengajuan ${application.scholarshipName || "Beasiswa"}`,
        email: application.formData?.email,
        status: application.status,
        currentStep: application.currentStep,
        applicationId: application.id,
    };

    return (
        <SuratPreviewContent
            defaultStage="supervisor"
            data={previewData}
            applicationId={id}
            backUrl="/supervisor-akademik/surat/perlu-tindakan"
        />
    );
}
