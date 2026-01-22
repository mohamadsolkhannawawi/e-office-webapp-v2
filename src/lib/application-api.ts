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
    letterType?: {
        id: string;
        name: string;
        description?: string;
    };
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
    letterType?: {
        id: string;
        name: string;
        description?: string;
    };
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
    publishedAt?: string;
    letterNumber?: string;
    verification?: {
        code: string;
        verifiedCount: number;
        qrCodeUrl: string;
        verifyLink: string;
    };
    values?: Record<string, unknown>;
    createdBy?: {
        mahasiswa?: {
            nim: string;
            user?: {
                name: string;
            };
        };
    };
    history?: Array<{
        actor: {
            name: string;
            role?: {
                name: string;
            };
        };
        action: string;
        note?: string;
        status: string;
        createdAt: string;
    }>;
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

/**
 * Interface untuk konfigurasi pejabat penandatangan
 */
export interface LeadershipConfig {
    name: string;
    nip: string;
    jabatan: string;
}

/**
 * Fetch letter configuration by key (e.g., "WAKIL_DEKAN_1", "KOP_SURAT_FSM")
 */
export async function getLetterConfig(
    key: string,
): Promise<LeadershipConfig | null> {
    try {
        const response = await fetch(`/api/master/letter-config/${key}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.warn(`Letter config '${key}' not found, using defaults`);
            return null;
        }

        const result = await response.json();
        return result.value as LeadershipConfig;
    } catch (error) {
        console.error("Get letter config error:", error);
        return null;
    }
}

/**
 * Update letter configuration
 */
export async function updateLetterConfig(
    key: string,
    value: Record<string, unknown>,
): Promise<boolean> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/master/letter-config/${key}`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ value }),
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to update config: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Update letter config error:", error);
        return false;
    }
}

/**
 * Interface untuk User Signature
 */
export interface UserSignature {
    id: string;
    url: string;
    signatureType: "UPLOADED" | "DRAWN" | "TEMPLATE";
    isDefault: boolean;
    checksum?: string;
    createdAt: string;
}

/**
 * Fetch all signatures for current user
 */
export async function getSignatures(): Promise<UserSignature[]> {
    try {
        const response = await fetch("/api/signatures", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Get signatures error:", error);
        return [];
    }
}

/**
 * Save new signature template
 */
export async function saveSignature(data: {
    url: string;
    signatureType?: "UPLOADED" | "DRAWN" | "TEMPLATE";
    isDefault?: boolean;
}): Promise<UserSignature | null> {
    try {
        const response = await fetch("/api/signatures", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to save signature");
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Save signature error:", error);
        return null;
    }
}

/**
 * Set signature as default
 */
export async function setDefaultSignature(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/signatures/${id}/default`, {
            method: "PATCH",
            credentials: "include",
        });

        return response.ok;
    } catch (error) {
        console.error("Set default signature error:", error);
        return false;
    }
}

/**
 * Delete signature template
 */
export async function deleteSignature(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/signatures/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        return response.ok;
    } catch (error) {
        console.error("Delete signature error:", error);
        return false;
    }
}

/**
 * Preview nomor surat berikutnya (tanpa increment)
 */
export async function previewLetterNumber(
    type: string = "SRB",
): Promise<string | null> {
    try {
        const response = await fetch(
            `/api/master/letter-number/preview?type=${type}`,
            {
                method: "GET",
                credentials: "include",
            },
        );

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        return result.data?.nextNumber || null;
    } catch (error) {
        console.error("Preview letter number error:", error);
        return null;
    }
}

/**
 * Generate nomor surat baru (dengan increment counter)
 */
export async function generateLetterNumber(
    type: string = "SRB",
    applicationId?: string,
): Promise<{
    letterNumber: string;
    verification?: {
        code: string;
        verifyUrl: string;
        qrImage: string;
    };
} | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/master/letter-number/generate`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type, applicationId }),
            },
        );
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Generate letter number error:", error);
        return null;
    }
}

/**
 * Interface untuk Notification
 */
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    entityId?: string;
    createdAt: string;
}

/**
 * Fetch notifications for current user
 */
export async function getNotifications(options?: {
    limit?: number;
    unreadOnly?: boolean;
}): Promise<Notification[]> {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.set("limit", String(options.limit));
        if (options?.unreadOnly) params.set("unreadOnly", "true");

        const response = await fetch(`/api/notifications?${params}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) return [];
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Get notifications error:", error);
        return [];
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const response = await fetch("/api/notifications/count", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) return 0;
        const result = await response.json();
        return result.data?.unread || 0;
    } catch (error) {
        console.error("Get unread count error:", error);
        return 0;
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/notifications/${id}/read`, {
            method: "PATCH",
            credentials: "include",
        });
        return response.ok;
    } catch (error) {
        console.error("Mark as read error:", error);
        return false;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
    try {
        const response = await fetch("/api/notifications/read-all", {
            method: "PATCH",
            credentials: "include",
        });
        return response.ok;
    } catch (error) {
        console.error("Mark all as read error:", error);
        return false;
    }
}

/**
 * Public Verification API
 */
export async function verifyLetterPublic(code: string): Promise<{
    valid: boolean;
    data?: {
        letterNumber: string;
        issuedAt: string;
        verifiedCount: number;
        application: {
            id: string;
            scholarshipName: string;
            status: string;
        };
    };
    message?: string;
} | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/public/verification/${code}`,
            {
                method: "GET",
            },
        );

        if (!response.ok) {
            return { valid: false, message: "Dokumen tidak ditemukan" };
        }

        return await response.json();
    } catch (error) {
        console.error("Verification error:", error);
        return null;
    }
}

/**
 * Interface untuk User Profile
 */
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    image?: string;
    mahasiswa?: {
        id: string;
        nim: string;
        noHp: string;
        tahunMasuk: string;
        alamat?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        semester?: number;
        ipk?: number;
        ips?: number;
        departemen?: { name: string };
        programStudi?: { name: string };
    };
    pegawai?: {
        id: string;
        nip: string;
        jabatan: string;
        noHp?: string;
        departemen?: { name: string };
        programStudi?: { name: string };
    };
    userRole?: Array<{
        role: { name: string };
    }>;
}

/**
 * Fetch current user profile
 */
export async function getMe(): Promise<UserProfile | null> {
    try {
        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Get profile error:", error);
        return null;
    }
}

/**
 * Update current user profile
 */
export async function updateProfile(data: {
    name: string;
    noHp?: string;
}): Promise<boolean> {
    try {
        const response = await fetch("/api/me", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return response.ok;
    } catch (error) {
        console.error("Update profile error:", error);
        return false;
    }
}
