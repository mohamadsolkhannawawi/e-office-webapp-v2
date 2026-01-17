// Type definitions untuk Detail Surat

export interface IdentitasPengajuData {
    namaLengkap: string;
    nimNip: string;
    email: string;
    departemen: string;
    programStudi: string;
    tempatLahir: string;
    tanggalLahir: string; // Format: "DD/MM/YYYY"
    noHp: string;
    ipk: string;
    sks: string;
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
    role: string;
    status: string;
    date: string; // Format: "DD Bulan YYYY" misal, "06 November 2021"
    time: string; // Format: "HH:MM:SS" misal, "09:43:48"
    catatan?: string;
}

export interface DetailSuratPageData {
    id?: string;
    identitas: IdentitasPengajuData;
    detailSurat: DetailSuratData;
    lampiran: LampiranFile[];
    riwayat: RiwayatItem[];
}

// Dummy data untuk development
export const dummyDetailSuratData: DetailSuratPageData = {
    id: "1",
    identitas: {
        namaLengkap: "Ahmad Syaifullah",
        nimNip: "24060121120000",
        email: "ahmadsyaifullah@students.undip.ac.id",
        departemen: "Informatika",
        programStudi: "Informatika",
        tempatLahir: "Blora",
        tanggalLahir: "03/18/2003",
        noHp: "081234567890",
        ipk: "3.6",
        sks: "102",
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
            role: "Admin Surat",
            status: "Diajukan",
            date: "06 November 2021",
            time: "09:43:48",
        },
        {
            role: "Supervisor Akademik",
            status: "Verifikasi Supervisor Akademik",
            date: "05 November 2021",
            time: "07:12:34",
            catatan: "Sudah diverifikasi oleh Supervisor Akademik",
        },
        {
            role: "Supervisor Akademik",
            status: "Disetujui",
            date: "05 November 2021",
            time: "07:12:34",
        },
        {
            role: "Mahasiswa",
            status: "Diajukan",
            date: "04 November 2021",
            time: "14:58:12",
        },
    ],
};
