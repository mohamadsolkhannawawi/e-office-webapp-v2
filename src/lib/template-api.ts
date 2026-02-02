export interface Template {
    id: string;
    name: string;
    description?: string;
    templatePath: string;
    templateType: string;
    version: string;
    isActive: boolean;
    letterTypeId: string;
    letterType: {
        id: string;
        name: string;
        description?: string;
    };
}

export interface DocumentGenerationRequest {
    letterInstanceId: string;
    format?: "DOCX" | "PDF";
}

export interface DocumentGenerationResponse {
    success: boolean;
    data?: {
        filename: string;
        filePath: string;
        fileSize: number;
        processingTimeMs: number;
        downloadUrl: string;
    };
    error?: string;
}

// Cache for template IDs to avoid repeated API calls
const templateIdCache: Map<string, string> = new Map();

/**
 * Get template by letter type name (e.g., "Surat Rekomendasi Beasiswa")
 */
export async function getTemplateByLetterType(
    letterTypeName: string,
): Promise<{ success: boolean; data?: Template; error?: string }> {
    try {
        const response = await fetch(
            `/api/templates/by-letter-type/${encodeURIComponent(letterTypeName)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching template for ${letterTypeName}:`, error);
        throw error;
    }
}

/**
 * Get template ID by letter type name, with caching
 */
export async function getTemplateIdByLetterType(
    letterTypeName: string,
): Promise<string | null> {
    // Check cache first
    if (templateIdCache.has(letterTypeName)) {
        return templateIdCache.get(letterTypeName) || null;
    }

    try {
        const result = await getTemplateByLetterType(letterTypeName);
        if (result.success && result.data) {
            templateIdCache.set(letterTypeName, result.data.id);
            return result.data.id;
        }
        return null;
    } catch (error) {
        console.error(
            `Error getting template ID for ${letterTypeName}:`,
            error,
        );
        return null;
    }
}

/**
 * Get all available document templates
 */
export async function getTemplates(): Promise<{
    success: boolean;
    data: Template[];
}> {
    try {
        const response = await fetch("/api/templates", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch templates: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching templates:", error);
        throw error;
    }
}

/**
 * Get template by ID
 */
export async function getTemplate(
    id: string,
): Promise<{ success: boolean; data: Template }> {
    try {
        const response = await fetch(`/api/templates/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch template ${id}: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching template ${id}:`, error);
        throw error;
    }
}

/**
 * Generate document from template using letter instance
 */
export async function generateDocument(
    templateId: string,
    request: DocumentGenerationRequest,
): Promise<DocumentGenerationResponse> {
    try {
        const response = await fetch(`/api/templates/generate/${templateId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Failed to generate document: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error generating document:", error);
        throw error;
    }
}

/**
 * Download generated document
 */
export async function downloadDocument(downloadUrl: string): Promise<Blob> {
    try {
        const response = await fetch(downloadUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to download document");
        }

        return await response.blob();
    } catch (error) {
        console.error("Error downloading document:", error);
        throw error;
    }
}

/**
 * Download pre-generated document from letter instance
 * (auto-generated during approval process)
 * Now extracts the formal filename from the server's Content-Disposition header
 */
export async function downloadPreGeneratedDocument(
    letterInstanceId: string,
    filename?: string,
): Promise<void> {
    try {
        console.log(
            `🔍 [downloadPreGeneratedDocument] Fetching from /api/templates/letter/${letterInstanceId}/download`,
        );

        const response = await fetch(
            `/api/templates/letter/${letterInstanceId}/download`,
            {
                method: "GET",
            },
        );

        console.log(
            `📊 [downloadPreGeneratedDocument] Response status: ${response.status}`,
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `❌ [downloadPreGeneratedDocument] Failed with status ${response.status}: ${errorText}`,
            );
            throw new Error(
                `Failed to download pre-generated document: ${response.status}`,
            );
        }

        const blob = await response.blob();
        console.log(
            `✅ [downloadPreGeneratedDocument] Got blob, size: ${blob.size} bytes`,
        );

        // Try to extract filename from Content-Disposition header
        let downloadFilename = filename;
        if (!downloadFilename) {
            const contentDisposition = response.headers.get(
                "Content-Disposition",
            );
            if (contentDisposition) {
                // Try different regex patterns to catch various browser/server/proxy behaviors
                const filenameMatch =
                    contentDisposition.match(/filename="?([^"]+)"?/) ||
                    contentDisposition.match(/filename=([^;]+)/);

                if (filenameMatch && filenameMatch[1]) {
                    downloadFilename = filenameMatch[1]
                        .replace(/['"]/g, "")
                        .trim();
                    console.log(
                        `📝 [downloadPreGeneratedDocument] Extracted filename from header: ${downloadFilename}`,
                    );
                } else {
                    console.warn(
                        `⚠️ [downloadPreGeneratedDocument] could not match filename from header: ${contentDisposition}`,
                    );
                }
            } else {
                console.warn(
                    `⚠️ [downloadPreGeneratedDocument] Content-Disposition header missing or empty`,
                );
            }
        }

        // Fallback to default filename
        if (!downloadFilename) {
            downloadFilename = `surat-rekomendasi-${letterInstanceId}.docx`;
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log(
            `📥 [downloadPreGeneratedDocument] Download triggered: ${a.download}`,
        );
    } catch (error) {
        console.error(
            "❌ [downloadPreGeneratedDocument] Error:",
            error instanceof Error ? error.message : error,
        );
        throw error;
    }
}

/**
 * Check if DOCX preview is available for a letter instance
 */
export interface PreviewStatus {
    available: boolean;
    reason?: string;
    generatedAt?: string;
    fileSize?: number;
    previewUrl?: string;
    downloadUrl?: string;
}

export async function getDocxPreviewStatus(
    letterInstanceId: string,
): Promise<PreviewStatus> {
    try {
        const response = await fetch(
            `/api/templates/letter/${letterInstanceId}/preview-status`,
            {
                method: "GET",
            },
        );

        if (!response.ok) {
            return { available: false, reason: "fetch_error" };
        }

        const result = await response.json();
        return result.data || { available: false, reason: "unknown" };
    } catch (error) {
        console.error("Error checking preview status:", error);
        return { available: false, reason: "network_error" };
    }
}

/**
 * Trigger on-demand DOCX generation for a letter instance
 * This is useful when the document wasn't auto-generated on submit
 */
export async function triggerDocxGeneration(
    letterInstanceId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(
            `/api/templates/letter/${letterInstanceId}/generate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error:
                    errorData.error || `Failed to generate: ${response.status}`,
            };
        }

        const result = await response.json();
        return { success: result.success };
    } catch (error) {
        console.error("Error triggering DOCX generation:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

/**
 * Fetch DOCX file as ArrayBuffer for preview rendering
 * With timeout and detailed error handling
 */
export async function fetchDocxForPreview(
    letterInstanceId: string,
): Promise<ArrayBuffer> {
    console.log(
        `🔄 [fetchDocxForPreview] Starting fetch for: ${letterInstanceId}`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
        const response = await fetch(
            `/api/templates/letter/${letterInstanceId}/preview`,
            {
                method: "GET",
                signal: controller.signal,
            },
        );

        clearTimeout(timeoutId);

        console.log(
            `📊 [fetchDocxForPreview] Response status: ${response.status}`,
        );
        console.log(
            `📊 [fetchDocxForPreview] Content-Type: ${response.headers.get("content-type")}`,
        );
        console.log(
            `📊 [fetchDocxForPreview] Content-Length: ${response.headers.get("content-length")}`,
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `❌ [fetchDocxForPreview] Failed: ${response.status} - ${errorText}`,
            );
            throw new Error(
                `Failed to fetch DOCX for preview: ${response.status}`,
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log(
            `✅ [fetchDocxForPreview] Received ${arrayBuffer.byteLength} bytes`,
        );

        return arrayBuffer;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === "AbortError") {
            console.error(
                `❌ [fetchDocxForPreview] Request timed out after 30 seconds`,
            );
            throw new Error(
                "Request timed out. The document may be too large or the server is slow.",
            );
        }

        console.error(`❌ [fetchDocxForPreview] Error:`, error);
        throw error;
    }
}

/**
 * Generate and download document in one step
 * Priority: Try pre-generated first, then generate on-demand
 */
export async function generateAndDownloadDocument(
    templateId: string,
    letterInstanceId: string,
    filename?: string,
): Promise<void> {
    try {
        console.log(
            `🚀 [generateAndDownloadDocument] Starting for: ${letterInstanceId}`,
        );

        // 🔴 Priority 1: Try to download pre-generated document first
        // This is auto-generated when approvals are made at each stage
        try {
            console.log(
                "📄 [Priority 1] Attempting to download pre-generated document...",
            );
            await downloadPreGeneratedDocument(letterInstanceId, filename);
            console.log(
                "✅ [Priority 1] Pre-generated document downloaded successfully",
            );
            return;
        } catch (preGenError) {
            console.warn(
                `⚠️ [Priority 1] Pre-generated not available: ${preGenError instanceof Error ? preGenError.message : preGenError}`,
            );
            // Continue to fallback: generate on-demand
        }

        // 🔴 Priority 2: Generate document on-demand (fallback)
        console.log(
            `📄 [Priority 2] Generating document on-demand (templateId: ${templateId})`,
        );
        const result = await generateDocument(templateId, { letterInstanceId });

        if (!result.success || !result.data) {
            throw new Error(result.error || "Failed to generate document");
        }

        console.log(
            `✅ [Priority 2] Document generated, downloading from: ${result.data.downloadUrl}`,
        );

        // Download document
        const blob = await downloadDocument(result.data.downloadUrl);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log(
            `✅ [Priority 2] On-demand download triggered: ${a.download}`,
        );
    } catch (error) {
        console.error(
            "❌ [generateAndDownloadDocument] Error:",
            error instanceof Error ? error.message : error,
        );
        throw error;
    }
}
