/**
 * Definisi route constants untuk aplikasi
 */

// Auth routes
export const AUTH_ROUTES = {
    LOGIN: "/login",
    LOGOUT: "/logout",
} as const;

// Mahasiswa routes
export const MAHASISWA_ROUTES = {
    DASHBOARD: "/mahasiswa",
    SURAT_REKOMENDASI_BEASISWA: "/mahasiswa/surat-rekomendasi-beasiswa",
    RIWAYAT: "/mahasiswa/riwayat",
} as const;

// Supervisor Akademik routes
export const SUPERVISOR_ROUTES = {
    DASHBOARD: "/supervisor-akademik",
    VERIFIKASI: "/supervisor-akademik/verifikasi",
    RIWAYAT: "/supervisor-akademik/riwayat",
} as const;

// Manajer TU routes
export const MANAJER_TU_ROUTES = {
    DASHBOARD: "/manajer-tu",
    INCOMING: "/manajer-tu/incoming",
    OUTGOING: "/manajer-tu/outgoing",
} as const;

// Wakil Dekan 1 routes
export const WAKIL_DEKAN_ROUTES = {
    DASHBOARD: "/wakil-dekan-1",
    APPROVAL: "/wakil-dekan-1/approval",
    LAPORAN: "/wakil-dekan-1/laporan",
} as const;

// UPA routes
export const UPA_ROUTES = {
    DASHBOARD: "/upa",
    MANAJEMEN_BEASISWA: "/upa/manajemen-beasiswa",
    LAPORAN: "/upa/laporan",
} as const;

// Combined routes export
export const ROUTES = {
    AUTH: AUTH_ROUTES,
    MAHASISWA: MAHASISWA_ROUTES,
    SUPERVISOR: SUPERVISOR_ROUTES,
    MANAJER_TU: MANAJER_TU_ROUTES,
    WAKIL_DEKAN: WAKIL_DEKAN_ROUTES,
    UPA: UPA_ROUTES,
} as const;
