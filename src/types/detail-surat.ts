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

// Dummy data untuk development
export const dummyDetailSuratData: DetailSuratPageData = {
    id: "1",
    status: "IN_PROGRESS",
    currentStep: 2,
    scholarshipName: "Beasiswa Djarum Foundation",
    identitas: {
        namaLengkap: "Ahmad Syaifullah",
        role: "Mahasiswa",
        nim: "24060121120000",
        email: "ahmadsyaifullah@students.undip.ac.id",
        departemen: "Informatika",
        programStudi: "Informatika",
        tempatLahir: "Blora",
        tanggalLahir: "03/18/2003",
        noHp: "081234567890",
        semester: "5",
        ipk: "3.6",
        ips: "3.8",
    },
    detailSurat: {
        jenisSurat: "SRB / Surat Rekomendasi Beasiswa",
        keperluan: "Beasiswa Djarum Foundation",
    },
    lampiran: [
        {
            name: "File Proposal.pdf",
            type: "PDF Document",
            size: "2.3 MB",
        },
        {
            name: "KTM.jpg",
            type: "Image",
            size: "1.1 MB",
        },
    ],
    riwayat: [
        {
            id: "r1",
            senderRole: "Supervisor Akademik",
            receiverRole: "Manajer TU",
            status: "Disetujui",
            date: "06 November 2021",
            time: "09:43:48",
            actionType: "APPROVE",
        },
    ],
};
