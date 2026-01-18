export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateNamaLengkap(value: unknown): ValidationResult {
    const errors: string[] = [];
    let parsed = "";
    if (typeof value === "string") {
        parsed = value.trim();
    } else if (value != null) {
        parsed = String(value).trim();
    }
    if (parsed === "") {
        errors.push("Nama lengkap harus valid dan tidak boleh kosong");
    }
    return { valid: errors.length === 0, errors };
}

export function validateRole(value: unknown): ValidationResult {
    const errors: string[] = [];
    let parsed = "";
    if (typeof value === "string") {
        parsed = value.trim();
    } else if (value != null) {
        parsed = String(value).trim();
    }
    if (parsed === "") {
        errors.push("Role harus valid dan tidak boleh kosong");
    }
    return { valid: errors.length === 0, errors };
}

export function validateNIM(value: unknown): ValidationResult {
    const errors: string[] = [];
    const nimStr = typeof value === "string" ? value : String(value);
    if (!/^[0-9]{12,14}$/.test(nimStr)) {
        errors.push("NIM harus 12-14 digit angka");
    }
    return { valid: errors.length === 0, errors };
}

export function validateEmail(value: unknown): ValidationResult {
    const errors: string[] = [];
    const emailStr = typeof value === "string" ? value : String(value);
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailStr)) {
        errors.push("Format email tidak valid");
    }
    return { valid: errors.length === 0, errors };
}

export function validateDepartemen(value: unknown): ValidationResult {
    const errors: string[] = [];
    let parsed = "";
    if (typeof value === "string") {
        parsed = value.trim();
    } else if (value != null) {
        parsed = String(value).trim();
    }
    if (parsed === "") {
        errors.push("Departemen harus valid dan tidak boleh kosong");
    }
    return { valid: errors.length === 0, errors };
}

export function validateProgramStudi(value: unknown): ValidationResult {
    const errors: string[] = [];
    let parsed = "";
    if (typeof value === "string") {
        parsed = value.trim();
    } else if (value != null) {
        parsed = String(value).trim();
    }
    if (parsed === "") {
        errors.push("Program Studi harus valid dan tidak boleh kosong");
    }
    return { valid: errors.length === 0, errors };
}

export function validateTempatLahir(value: unknown): ValidationResult {
    const errors: string[] = [];
    let parsed = "";
    if (typeof value === "string") {
        parsed = value.trim();
    } else if (value != null) {
        parsed = String(value).trim();
    }
    if (parsed === "") {
        errors.push("Tempat lahir harus valid dan tidak boleh kosong");
    }
    return { valid: errors.length === 0, errors };
}

export function validateNoHp(value: unknown): ValidationResult {
    const errors: string[] = [];
    const hpStr = typeof value === "string" ? value : String(value);
    if (!/^08[0-9]{8,11}$/.test(hpStr)) {
        errors.push(
            "Format nomor HP tidak valid. Harus dimulai dengan 08 dan terdiri dari 10-13 digit",
        );
    }
    return { valid: errors.length === 0, errors };
}

export function validateIPK(value: unknown): ValidationResult {
    const errors: string[] = [];
    let ipkNum: number | null = null;
    if (typeof value === "number") {
        ipkNum = value;
    } else if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            ipkNum = parsed;
        }
    }
    if (ipkNum === null || ipkNum < 0 || ipkNum > 4) {
        errors.push("IPK harus antara 0.00 - 4.00");
    }
    return { valid: errors.length === 0, errors };
}

export function validateIPS(value: unknown): ValidationResult {
    const errors: string[] = [];
    let ipsNum: number | null = null;
    if (typeof value === "number") {
        ipsNum = value;
    } else if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            ipsNum = parsed;
        }
    }
    if (ipsNum === null || ipsNum < 0 || ipsNum > 4) {
        errors.push("IPS harus antara 0.00 - 4.00");
    }
    return { valid: errors.length === 0, errors };
}

export function validateTanggalLahir(value: unknown): ValidationResult {
    const errors: string[] = [];
    if (!value || value === "") {
        errors.push("Tanggal lahir harus diisi");
    }
    return { valid: errors.length === 0, errors };
}

export function validateSemester(value: unknown): ValidationResult {
    const errors: string[] = [];
    let parsed: number | null = null;
    if (typeof value === "number") {
        parsed = value;
    } else if (typeof value === "string") {
        const p = parseInt(value);
        if (!isNaN(p)) parsed = p;
    }
    if (parsed === null || parsed < 1 || parsed > 14) {
        errors.push("Semester harus valid (1-14)");
    }
    return { valid: errors.length === 0, errors };
}

export function validateNamaBeasiswa(value: unknown): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== "string" || value.trim() === "") {
        errors.push("Nama beasiswa wajib diisi");
    }

    return { valid: errors.length === 0, errors };
}
