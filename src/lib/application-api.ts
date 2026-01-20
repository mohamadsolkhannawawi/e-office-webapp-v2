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
    namaBeasiswa?: string; // Added optional
    semester?: string; // Added optional
    jenisBeasiswa?: string; // Added optional
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
    status:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "REJECTED"
        | "REVISION"
        | "DRAFT";
    currentStep: number;
    formData: ApplicationFormData;
    attachmentsCount: number;
    createdAt: string;
    updatedAt: string;
    applicantName?: string; // Added for convenience
    createdBy?: {
        mahasiswa?: {
            nim: string;
            user?: {
                name: string;
            };
        };
    };
}

export interface ApplicationDetail {
    id: string;
    scholarshipName: string;
    status:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "REJECTED"
        | "REVISION"
        | "DRAFT";
    currentStep: number;
    formData: ApplicationFormData;
    attachments: ApplicationAttachment[];
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        mahasiswa?: {
            nim: string;
            user?: {
                name: string;
            };
        };
    };
}

/**
 * Fetch applications with optional filters
 */
export async function getApplications(params?: {
    status?: string;
    page?: number;
    limit?: number;
    currentStep?: number;
    mode?: string;
    search?: string;
    jenisBeasiswa?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: "asc" | "desc";
}): Promise<{
    data: ApplicationSummary[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}> {
    try {
        const url = new URL(
            "/api/surat-rekomendasi/applications",
            window.location.origin,
        );
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(url.toString(), {
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
        return {
            data: result.data || [],
            meta: result.meta || {},
        };
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

/**
 * Fetch application statistics
 */
export async function getStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    rejected: number;
    totalCreatedThisMonth: number;
    totalCompletedThisMonth: number;
    trend: { date: string; count: number }[];
    distribution: {
        pending: number;
        inProgress: number;
        completed: number;
        rejected: number;
    };
}> {
    try {
        const response = await fetch("/api/surat-rekomendasi/stats", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Get stats error:", error);
        // Return zeros on error to prevent UI crash
        return {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
            totalCreatedThisMonth: 0,
            totalCompletedThisMonth: 0,
            trend: [],
            distribution: {
                pending: 0,
                inProgress: 0,
                completed: 0,
                rejected: 0,
            },
        };
    }
}
/**
 * Verify / Process an application (Approve, Reject, Revision)
 */
export async function verifyApplication(
    applicationId: string,
    data: {
        action: "approve" | "reject" | "revision" | "publish";
        notes?: string;
        targetStep?: number;
        signatureUrl?: string;
        letterNumber?: string;
    },
): Promise<{ success: boolean; data: Record<string, unknown> }> {
    try {
        const response = await fetch(
            `/api/surat-rekomendasi/applications/${applicationId}/verify`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Verification failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Verify application error:", error);
        throw error;
    }
}
