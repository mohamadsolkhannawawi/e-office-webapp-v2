import { ApplicationDetail } from "@/lib/application-api";
import { PreviewData } from "@/components/features/surat-rekomendasi-beasiswa/preview/SuratPreviewContent";

interface MapOptions {
  no?: string; // Override opsional untuk nomor surat
}

export function mapApplicationToPreviewData(
  application: ApplicationDetail,
  options: MapOptions = {},
): PreviewData {
  // Helper untuk mengambil nama beasiswa untuk field keperluan
  // Catatan: template HTML sudah memiliki prefix "Pengajuan Beasiswa"
  // sehingga di sini cukup mengembalikan nama beasiswanya
  const getKeperluan = () => {
    return (
      application.scholarshipName || application.formData.namaBeasiswa || ""
    );
  };

  // Helper untuk memformat tanggal
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
    // Logika Single Source of Truth:
    // 1. Override dari URL (options.no) menjadi prioritas utama
    // 2. Lalu gunakan nomor surat yang sudah ada di DB
    nomorSurat: options.no || application.letterNumber,

    // Logika tanda tangan:
    // Verifikasi khusus untuk signature WD1 di values
    signatureUrl:
      typeof application.values?.wd1_signature === "string"
        ? application.values.wd1_signature
        : undefined,

    // Logika stempel:
    // Sertakan ID dan URL stempel jika tersedia
    stampId: application.stampId || undefined,
    stampUrl: application.stamp?.url || undefined,

    publishedAt: formatDate(application.publishedAt),
    qrCodeUrl: application.verification?.qrCodeUrl,
    jenisBeasiswa: (application.formData.jenisBeasiswa as string) || "internal",
    scholarshipName: application.scholarshipName || "",
  };
}
