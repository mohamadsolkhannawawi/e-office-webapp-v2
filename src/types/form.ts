export interface LampiranFile {
    name: string;
    size: number;
    type: string;
    kategori?: string;
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
    [key: string]: unknown;
};
