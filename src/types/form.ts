export interface LampiranFile {
    id?: string; // Diberikan dari respons API
    name: string;
    size: number;
    type?: string;
    kategori?: string;
    attachmentType?: "File" | "Foto" | "Lainnya";
    createdAt?: string;
    file?: File;
    downloadUrl?: string;
    [key: string]: unknown;
}

export type FormDataType = {
    namaLengkap: string;
    role: string;
    nim: string;
    email: string;
    departemen: string;
    programStudi: string;
    tempatLahir: string;
    tanggalLahir: string;
    noHp: string;
    ipk: string;
    ips: string;
    semester: string;
    namaBeasiswa: string;
    lampiranUtama: LampiranFile[];
    lampiranTambahan: LampiranFile[];
    letterInstanceId?: string; // Dibuat setelah submit ke API
    [key: string]: unknown;
};
