/**
 * Definisi role yang tersedia dalam sistem
 */
export const ROLES = {
    MAHASISWA: "mahasiswa",
    SUPERVISOR_AKADEMIK: "supervisor-akademik",
    MANAJER_TU: "manajer-tu",
    WAKIL_DEKAN_1: "wakil-dekan-1",
    UPA: "upa",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Konfigurasi untuk setiap role
 */
export const ROLE_CONFIG = {
    [ROLES.MAHASISWA]: {
        label: "Mahasiswa",
        description: "Pengaju beasiswa",
        dashboardPath: "/mahasiswa",
        color: "blue",
    },
    [ROLES.SUPERVISOR_AKADEMIK]: {
        label: "Supervisor Akademik",
        description: "Verifikator tingkat prodi",
        dashboardPath: "/supervisor-akademik",
        color: "purple",
    },
    [ROLES.MANAJER_TU]: {
        label: "Manajer TU",
        description: "Pengelola surat masuk/keluar",
        dashboardPath: "/manajer-tu",
        color: "green",
    },
    [ROLES.WAKIL_DEKAN_1]: {
        label: "Wakil Dekan 1",
        description: "Approval akhir",
        dashboardPath: "/wakil-dekan-1",
        color: "orange",
    },
    [ROLES.UPA]: {
        label: "UPA",
        description: "Admin beasiswa",
        dashboardPath: "/upa",
        color: "red",
    },
} as const;

/**
 * Helper function untuk mendapatkan path dashboard berdasarkan role
 */
export function getDashboardPath(role: RoleType): string {
    return ROLE_CONFIG[role]?.dashboardPath || "/";
}

/**
 * Helper function untuk mendapatkan label role
 */
export function getRoleLabel(role: RoleType): string {
    return ROLE_CONFIG[role]?.label || role;
}
