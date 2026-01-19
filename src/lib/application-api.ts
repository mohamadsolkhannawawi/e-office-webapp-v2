/**
 * API client untuk fetching application data
 */

export interface ApplicationFormData {
    namaLengkap: string;
    email: string;
    nim: string;
    departemen: string;
    programStudi: string;
    tempatLahir: string;
    tanggalLahir: string;
    noHp: string;
    ipk: string;
    ips: string;
}

export interface ApplicationAttachment {
    id: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    category: "Utama" | "Tambahan";
    attachmentType: "File" | "Foto" | "Lainnya";
    downloadUrl?: string;
    createdAt: string;
}

export interface ApplicationSummary {
    id: string;
    scholarshipName: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
    currentStep: number;
    formData: ApplicationFormData;
    attachmentsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationDetail {
    id: string;
    scholarshipName: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
    currentStep: number;
    formData: ApplicationFormData;
    attachments: ApplicationAttachment[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Fetch all applications
 */
export async function getApplications(): Promise<ApplicationSummary[]> {
    try {
        const response = await fetch("/api/surat-rekomendasi/applications", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch applications: ${response.status}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Get applications error:", error);
        throw error;
    }
}

/**
 * Fetch single application by ID
 */
export async function getApplicationById(
    applicationId: string,
): Promise<ApplicationDetail> {
    try {
        const response = await fetch(
            `/api/surat-rekomendasi/applications/${applicationId}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch application: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Get application error:", error);
        throw error;
    }
}
