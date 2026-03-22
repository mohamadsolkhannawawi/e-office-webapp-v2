const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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

// Cache untuk template ID agar tidak melakukan panggilan API berulang
const templateIdCache: Map<string, string> = new Map();

/**
 * Ambil template berdasarkan nama jenis surat (mis., "Surat Rekomendasi Beasiswa")
 */
export async function getTemplateByLetterType(
  letterTypeName: string,
): Promise<{ success: boolean; data?: Template; error?: string }> {
  try {
    const response = await fetch(
      `${BASE_PATH}/api/templates/by-letter-type/${encodeURIComponent(letterTypeName)}`,
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
 * Ambil template ID berdasarkan nama jenis surat dengan cache
 */
export async function getTemplateIdByLetterType(
  letterTypeName: string,
): Promise<string | null> {
  // Cek cache terlebih dahulu
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
    console.error(`Error getting template ID for ${letterTypeName}:`, error);
    return null;
  }
}

/**
 * Ambil semua template dokumen yang tersedia
 */
export async function getTemplates(): Promise<{
  success: boolean;
  data: Template[];
}> {
  try {
    const response = await fetch(`${BASE_PATH}/api/templates`, {
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
 * Ambil template berdasarkan ID
 */
export async function getTemplate(
  id: string,
): Promise<{ success: boolean; data: Template }> {
  try {
    const response = await fetch(`${BASE_PATH}/api/templates/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template ${id}: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw error;
  }
}

/**
 * Generate dokumen dari template menggunakan letter instance
 */
export async function generateDocument(
  templateId: string,
  request: DocumentGenerationRequest,
): Promise<DocumentGenerationResponse> {
  try {
    const response = await fetch(
      `${BASE_PATH}/api/templates/generate/${templateId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );

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
 * Unduh dokumen hasil generate
 */
export async function downloadDocument(downloadUrl: string): Promise<Blob> {
  try {
    const response = await fetch(`${BASE_PATH}${downloadUrl}`, {
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
 * Unduh dokumen pre-generated dari letter instance
 * (dibuat otomatis saat proses approval)
 * Mengekstrak nama file formal dari header Content-Disposition server
 */
export async function downloadPreGeneratedDocument(
  letterInstanceId: string,
  filename?: string,
): Promise<void> {
  try {
    console.log(
      `[INFO] [downloadPreGeneratedDocument] Fetching from /api/templates/letter/${letterInstanceId}/download`,
    );

    const response = await fetch(
      `${BASE_PATH}/api/templates/letter/${letterInstanceId}/download`,
      {
        method: "GET",
      },
    );

    console.log(
      `[INFO] [downloadPreGeneratedDocument] Response status: ${response.status}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ERROR] [downloadPreGeneratedDocument] Failed with status ${response.status}: ${errorText}`,
      );
      throw new Error(
        `Failed to download pre-generated document: ${response.status}`,
      );
    }

    const blob = await response.blob();
    console.log(
      `[INFO] [downloadPreGeneratedDocument] Got blob, size: ${blob.size} bytes`,
    );

    // Coba ekstrak nama file dari header Content-Disposition
    let downloadFilename = filename;
    if (!downloadFilename) {
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        // Coba beberapa pola regex untuk berbagai perilaku browser/server/proxy
        const filenameMatch =
          contentDisposition.match(/filename="?([^"]+)"?/) ||
          contentDisposition.match(/filename=([^;]+)/);

        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, "").trim();
          console.log(
            `[INFO] [downloadPreGeneratedDocument] Extracted filename from header: ${downloadFilename}`,
          );
        } else {
          console.warn(
            `[WARN] [downloadPreGeneratedDocument] could not match filename from header: ${contentDisposition}`,
          );
        }
      } else {
        console.warn(
          `[WARN] [downloadPreGeneratedDocument] Content-Disposition header missing or empty`,
        );
      }
    }

    // Gunakan nama file default sebagai fallback
    if (!downloadFilename) {
      downloadFilename = `surat-rekomendasi-${letterInstanceId}.docx`;
    }

    // Buat link unduhan
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log(
      `[INFO] [downloadPreGeneratedDocument] Download triggered: ${a.download}`,
    );
  } catch (error) {
    console.error(
      "[ERROR] [downloadPreGeneratedDocument] Error:",
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

/**
 * Cek apakah preview DOCX tersedia untuk sebuah letter instance
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
      `${BASE_PATH}/api/templates/letter/${letterInstanceId}/preview-status`,
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
 * Trigger generate DOCX on-demand untuk sebuah letter instance
 * Berguna saat dokumen belum otomatis tergenerate saat submit
 */
export async function triggerDocxGeneration(
  letterInstanceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${BASE_PATH}/api/templates/letter/${letterInstanceId}/generate`,
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
        error: errorData.error || `Failed to generate: ${response.status}`,
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
 * Ambil file DOCX sebagai ArrayBuffer untuk render preview
 * Dengan timeout dan penanganan error yang detail
 */
export async function fetchDocxForPreview(
  letterInstanceId: string,
): Promise<ArrayBuffer> {
  console.log(
    `[INFO] [fetchDocxForPreview] Starting fetch for: ${letterInstanceId}`,
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // timeout 30 detik

  try {
    const response = await fetch(
      `${BASE_PATH}/api/templates/letter/${letterInstanceId}/preview`,
      {
        method: "GET",
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    console.log(
      `[INFO] [fetchDocxForPreview] Response status: ${response.status}`,
    );
    console.log(
      `[INFO] [fetchDocxForPreview] Content-Type: ${response.headers.get("content-type")}`,
    );
    console.log(
      `[INFO] [fetchDocxForPreview] Content-Length: ${response.headers.get("content-length")}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ERROR] [fetchDocxForPreview] Failed: ${response.status} - ${errorText}`,
      );
      throw new Error(`Failed to fetch DOCX for preview: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(
      `[INFO] [fetchDocxForPreview] Received ${arrayBuffer.byteLength} bytes`,
    );

    return arrayBuffer;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.error(
        `[ERROR] [fetchDocxForPreview] Request timed out after 30 seconds`,
      );
      throw new Error(
        "Request timed out. The document may be too large or the server is slow.",
      );
    }

    console.error(`[ERROR] [fetchDocxForPreview] Error:`, error);
    throw error;
  }
}

/**
 * Generate dan unduh dokumen dalam satu langkah
 * Prioritas: coba dokumen pre-generated terlebih dahulu, lalu generate on-demand
 */
export async function generateAndDownloadDocument(
  templateId: string,
  letterInstanceId: string,
  filename?: string,
): Promise<void> {
  try {
    console.log(
      `[INFO] [generateAndDownloadDocument] Starting for: ${letterInstanceId}`,
    );

    // Prioritas 1: coba unduh dokumen pre-generated terlebih dahulu
    // Dokumen ini digenerate otomatis saat approval di tiap tahap
    try {
      console.log(
        "[INFO] [Priority 1] Attempting to download pre-generated document...",
      );
      await downloadPreGeneratedDocument(letterInstanceId, filename);
      console.log(
        "[INFO] [Priority 1] Pre-generated document downloaded successfully",
      );
      return;
    } catch (preGenError) {
      console.warn(
        `[WARN] [Priority 1] Pre-generated not available: ${preGenError instanceof Error ? preGenError.message : preGenError}`,
      );
      // Lanjut ke fallback: generate on-demand
    }

    // Prioritas 2: generate dokumen on-demand (fallback)
    console.log(
      `[INFO] [Priority 2] Generating document on-demand (templateId: ${templateId})`,
    );
    const result = await generateDocument(templateId, { letterInstanceId });

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to generate document");
    }

    console.log(
      `[INFO] [Priority 2] Document generated, downloading from: ${result.data.downloadUrl}`,
    );

    // Unduh dokumen
    const blob = await downloadDocument(result.data.downloadUrl);

    // Buat tautan unduhan
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || result.data.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log(
      `[INFO] [Priority 2] On-demand download triggered: ${a.download}`,
    );
  } catch (error) {
    console.error(
      "[ERROR] [generateAndDownloadDocument] Error:",
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}
