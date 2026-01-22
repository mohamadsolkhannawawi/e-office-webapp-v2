// Type definitions untuk Detail Surat

export type WorkflowRole =
    | "Mahasiswa"
    | "Supervisor Akademik"
    | "Manajer TU"
    | "Wakil Dekan 1"
    | "UPA";

export type ApplicationStatus =
    | "PENDING" // Menunggu Verifikasi
    | "IN_PROGRESS" // Sedang Diproses
    | "REVISION_REQUIRED" // Perlu Revisi
    | "REJECTED" // Ditolak
    | "COMPLETED" // Selesai/Published
    | "DRAFT"; // Belum dikirim

export interface IdentitasPengajuData {
    namaLengkap: string;
    role: string;
    nim: string;
    email: string;
    departemen: string;
    programStudi: string;
    tempatLahir: string;
    tanggalLahir: string; // Format: "DD/MM/YYYY"
    noHp: string;
    semester: string;
    ipk: string;
    ips: string;
}

export interface DetailSuratData {
    jenisSurat: string;
    keperluan: string;
}

export interface LampiranFile {
    name: string;
    type: string;
    size?: string;
    url?: string; // URL untuk unduh/pratinjau
}

export interface RiwayatItem {
    id: string;
    senderRole: WorkflowRole | string;
    receiverRole?: WorkflowRole | string;
    status: string;
    date: string;
    time: string;
    catatan?: string;
    actionType?: "APPROVE" | "REJECT" | "REVISION" | "SUBMIT" | "PUBLISH";
}

export interface DetailSuratPageData {
    id?: string;
    identitas: IdentitasPengajuData;
    detailSurat: DetailSuratData;
    lampiran: LampiranFile[];
    riwayat: RiwayatItem[];
    status: ApplicationStatus;
    currentStep: number;
    scholarshipName: string;
    noSurat?: string;
    signatureData?: {
        method: "upload" | "template" | "canvas";
        path?: string;
        timestamp: string;
    };
}
