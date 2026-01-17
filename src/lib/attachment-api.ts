/**
 * API client untuk handling attachment uploads
 * Digunakan di Lampiran.tsx untuk upload files ke backend MinIO
 */

interface UploadAttachmentResponse {
    success: boolean;
    data: {
        id: string;
        filename: string;
        fileSize: number;
        mimeType: string;
        category: "Utama" | "Tambahan";
        attachmentType: "File" | "Foto" | "Lainnya";
        downloadUrl: string;
        createdAt: string;
    };
}

interface UploadError {
    error: string;
}

/**
 * Upload file attachment ke API
 */
export async function uploadAttachment(
    letterInstanceId: string,
    file: File,
    category: "Utama" | "Tambahan"
): Promise<UploadAttachmentResponse | null> {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const response = await fetch(
            `/api/surat-rekomendasi/${letterInstanceId}/upload`,
            {
                method: "POST",
                body: formData,
                // Jangan atur header Content-Type, biarkan browser mengaturnya dengan boundary
                // Sertakan kredensial agar cookie (sesi) dikirim ke backend
                credentials: "include",
            }
        );

        if (!response.ok) {
            const error = (await response.json()) as UploadError;
            throw new Error(
                error.error || `Upload failed with status ${response.status}`
            );
        }

        return (await response.json()) as UploadAttachmentResponse;
    } catch (error) {
        console.error("Upload attachment error:", error);
        throw error;
    }
}

/**
 * Delete attachment from backend
 */
export async function deleteAttachment(attachmentId: string): Promise<boolean> {
    try {
        const response = await fetch(
            `/api/surat-rekomendasi/attachments/${attachmentId}`,
            {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const error = (await response.json()) as UploadError;
            throw new Error(
                error.error || `Delete failed with status ${response.status}`
            );
        }

        return true;
    } catch (error) {
        console.error("Delete attachment error:", error);
        throw error;
    }
}

/**
 * Get all attachments for a letter instance
 */
export async function getAttachments(
    letterInstanceId: string
): Promise<UploadAttachmentResponse["data"][]> {
    try {
        const response = await fetch(
            `/api/surat-rekomendasi/${letterInstanceId}/attachments`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const error = (await response.json()) as UploadError;
            throw new Error(error.error || `Failed to fetch attachments`);
        }

        const result = (await response.json()) as {
            success: boolean;
            data: UploadAttachmentResponse["data"][];
        };
        return result.data;
    } catch (error) {
        console.error("Get attachments error:", error);
        throw error;
    }
}

/**
 * Create new scholarship application (LetterInstance)
 */
export async function createApplication(
    namaBeasiswa: string,
    values: Record<string, unknown>
): Promise<{ id: string; scholarshipName: string }> {
    try {
        const response = await fetch("/api/surat-rekomendasi/applications", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                namaBeasiswa,
                values,
            }),
        });

        if (!response.ok) {
            const error = (await response.json()) as UploadError;
            throw new Error(error.error || `Create application failed`);
        }

        const result = (await response.json()) as {
            success: boolean;
            data: { id: string; scholarshipName: string };
        };
        return result.data;
    } catch (error) {
        console.error("Create application error:", error);
        throw error;
    }
}
