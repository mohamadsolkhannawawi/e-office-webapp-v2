export interface LampiranFile {
    id?: string; // API response에서 제공
    name: string;
    size: number;
    type?: string;
    kategori?: string;
    attachmentType?: "File" | "Foto" | "Lainnya";
    createdAt?: string;
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
    namaBeasiswa: string;
    lampiranUtama: LampiranFile[];
    lampiranTambahan: LampiranFile[];
    letterInstanceId?: string; // Created after submit to API
    [key: string]: unknown;
};
