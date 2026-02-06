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
    letterNumber?: string;
    status:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "REJECTED"
        | "REVISION"
        | "DRAFT";
    currentStep: number;
    lastRevisionFromRole?: string; // Role that requested the latest revision
    lastActorRole?: string; // Role that made the final decision (approve/reject)
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
    stampId?: string;
    stampUrl?: string;
    stamp?: {
        id: string;
        url: string;
        stampType: string;
    };
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
        };
        role?: {
            name: string;
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
 * Fetch application or create new draft if not found
 * This endpoint auto-creates a draft application if the ID doesn't exist
 */
export async function getApplicationByIdOrCreate(
    applicationId: string,
): Promise<ApplicationDetail & { isNewDraft?: boolean }> {
    try {
        const response = await fetch(
            `/api/surat-rekomendasi/applications/${applicationId}/or-create`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch or create application: ${response.status}`,
            );
        }

        const result = await response.json();
        return {
            ...result.data,
            isNewDraft: result.isNewDraft || false,
        };
    } catch (error) {
        console.error("Get or create application error:", error);
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
        stampId?: string;
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
        const response = await fetch(
            `/api/master/letterConfig/letter-config/${key}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

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
            `/api/master/letterConfig/letter-config/${key}`,
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
 * Save signature to application immediately
 */
export async function saveSignatureToApplication(
    applicationId: string,
    signatureUrl: string,
): Promise<boolean> {
    try {
        const response = await fetch(
            `/api/surat-rekomendasi/applications/${applicationId}/signature`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ signatureUrl }),
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to save signature: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Save signature error:", error);
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
}): Promise<{
    success: boolean;
    data: UserSignature | null;
    error?: string;
}> {
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
            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
                errorData.message ||
                `Failed to save signature (${response.status})`;
            console.error("Save signature error:", errorMessage);
            return {
                success: false,
                data: null,
                error: errorMessage,
            };
        }

        const result = await response.json();
        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Save signature error:", error);
        return {
            success: false,
            data: null,
            error: errorMessage,
        };
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

/* ===================== STAMP INTERFACES & FUNCTIONS ===================== */

export interface UserStamp {
    id: string;
    url: string;
    stampType: "UPLOADED" | "DRAWN" | "TEMPLATE";
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Fetch all stamps for current user (UPA)
 */
export async function getStamps(): Promise<UserStamp[]> {
    try {
        const response = await fetch("/api/stamps", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Get stamps error:", error);
        return [];
    }
}

/**
 * Save new stamp template
 */
export async function saveStamp(data: {
    url: string;
    stampType?: "UPLOADED" | "DRAWN" | "TEMPLATE";
}): Promise<{
    success: boolean;
    data: UserStamp | null;
    error?: string;
}> {
    try {
        const response = await fetch("/api/stamps", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
                errorData.message ||
                `Failed to save stamp (${response.status})`;
            console.error("Save stamp error:", errorMessage);
            return {
                success: false,
                data: null,
                error: errorMessage,
            };
        }

        const result = await response.json();
        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Save stamp error:", error);
        return {
            success: false,
            data: null,
            error: errorMessage,
        };
    }
}

/**
 * Set stamp as default
 */
export async function setDefaultStamp(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/stamps/${id}/default`, {
            method: "PATCH",
            credentials: "include",
        });

        return response.ok;
    } catch (error) {
        console.error("Set default stamp error:", error);
        return false;
    }
}

/**
 * Delete stamp template
 */
export async function deleteStamp(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/stamps/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        return response.ok;
    } catch (error) {
        console.error("Delete stamp error:", error);
        return false;
    }
}

/**
 * Apply stamp to letter
 */
export async function applyStampToLetter(
    applicationId: string,
    stampId: string,
): Promise<boolean> {
    try {
        const response = await fetch(`/api/stamps/apply/${applicationId}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ stampId }),
        });

        return response.ok;
    } catch (error) {
        console.error("Apply stamp error:", error);
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
 * Save/Update letter number untuk application (UPA role)
 * Returns verification data if successful
 */
export async function saveLetterNumber(
    applicationId: string,
    letterNumber: string,
): Promise<{
    success: boolean;
    verification?: {
        code: string;
        verifyUrl: string;
        qrImage: string;
    };
} | null> {
    try {
        const response = await fetch(
            `/api/master/letter-numbering/${applicationId}`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ letterNumber }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Save letter number error:",
                response.status,
                errorText,
            );
            return { success: false };
        }

        const result = await response.json();
        return {
            success: true,
            verification: result.data?.verification,
        };
    } catch (error) {
        console.error("Save letter number error:", error);
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
        const response = await fetch(`/api/master/letter-number/generate`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type, applicationId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Generate letter number error:",
                response.status,
                errorText,
            );
            return null;
        }

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
    letterInstanceId?: string;
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
 * Delete notification by id
 */
export async function deleteNotification(id: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/notifications/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        return response.ok;
    } catch (error) {
        console.error("Delete notification error:", error);
        return false;
    }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<boolean> {
    try {
        const response = await fetch("/api/notifications/delete-all", {
            method: "DELETE",
            credentials: "include",
        });
        return response.ok;
    } catch (error) {
        console.error("Delete all notifications error:", error);
        return false;
    }
}

/**
 * Public Verification API
 */
export interface VerificationHistory {
    action: string;
    note: string | null;
    actorName: string;
    roleName: string | null;
    status: string | null;
    timestamp: string;
}

export interface VerificationData {
    letterNumber: string;
    issuedAt: string;
    publishedAt: string | null;
    verifiedCount: number;
    letterType: {
        id: string;
        name: string;
        description: string | null;
    };
    applicant: {
        name: string;
        nim: string | null;
        departemen: string | null;
        programStudi: string | null;
    };
    application: {
        id: string;
        scholarshipName: string;
        status: string;
        createdAt: string;
    };
    history: VerificationHistory[];
    authenticity: {
        issuer: string;
        institution: string;
        verificationStatement: string;
        digitalSignatureValid: boolean;
    };
}

export async function verifyLetterPublic(code: string): Promise<{
    valid: boolean;
    data?: VerificationData;
    message?: string;
} | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/api/public/verification/${code}`,
            {
                method: "GET",
                cache: "no-store",
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
    image?: string;
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

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(imageData: string): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
}> {
    try {
        const response = await fetch("/api/me/photo", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: imageData, // base64 data URL or file path
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || "Upload failed",
            };
        }

        const result = await response.json();
        return {
            success: true,
            imageUrl: result.data?.image,
        };
    } catch (error) {
        console.error("Upload profile photo error:", error);
        return {
            success: false,
            error: "Network error occurred",
        };
    }
}

/**
 * Helper function to convert File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert file to base64"));
            }
        };
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsDataURL(file);
    });
}
