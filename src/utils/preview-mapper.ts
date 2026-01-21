import { ApplicationDetail } from "@/lib/application-api";
import { PreviewData } from "@/components/features/surat-rekomendasi-beasiswa/preview/SuratPreviewContent";

interface MapOptions {
    no?: string; // Optional override for letter number
}

export function mapApplicationToPreviewData(
    application: ApplicationDetail,
    options: MapOptions = {},
): PreviewData {
    // Helper to determine the purpose string
    const getKeperluan = () => {
        const name =
            application.scholarshipName ||
            application.formData.namaBeasiswa ||
            "Beasiswa";
        return name.toLowerCase().startsWith("pengajuan")
            ? name
            : `Pengajuan ${name}`;
    };

    // Helper to format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return undefined;
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    return {
        nama:
            application.formData.namaLengkap ||
            application.createdBy?.mahasiswa?.user?.name,
        nim: application.formData.nim,
        tempatLahir: application.formData.tempatLahir,
        tanggalLahir: formatDate(application.formData.tanggalLahir),
        noHp: application.formData.noHp,
        jurusan: application.formData.departemen,
        programStudi: application.formData.programStudi,
        semester: application.formData.semester,
        ipk: application.formData.ipk,
        ips: application.formData.ips,
        keperluan: getKeperluan(),
        email: application.formData.email,
        status: application.status,
        currentStep: application.currentStep,
        applicationId: application.id,
        // Single Source of Truth Logic:
        // 1. URL override (options.no) takes precedence
        // 2. Then existing letter number in DB
        nomorSurat: options.no || application.letterNumber,

        // Signature Logic:
        // Verify specifically for WD1 signature in values
        signatureUrl:
            typeof application.values?.wd1_signature === "string"
                ? application.values.wd1_signature
                : undefined,

        publishedAt: formatDate(application.publishedAt),
        qrCodeUrl: application.verification?.qrCodeUrl,
    };
}
