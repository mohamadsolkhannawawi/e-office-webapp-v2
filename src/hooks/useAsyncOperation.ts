import { useLoading } from "@/contexts/LoadingContext";
import toast from "react-hot-toast";

interface AsyncOperationOptions<T = unknown> {
    loadingKey?: string;
    loadingMessage?: string;
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    usePageLoader?: boolean;
    usePDFLoader?: boolean;
}

export const useAsyncOperation = () => {
    const { setPageLoading, setPDFLoading, setLoading } = useLoading();

    const executeWithLoading = async <T>(
        operation: () => Promise<T>,
        options: AsyncOperationOptions<T> = {},
    ): Promise<T | null> => {
        const {
            loadingKey,
            loadingMessage = "Memproses...",
            onSuccess,
            onError,
            usePageLoader = false,
            usePDFLoader = false,
        } = options;

        try {
            // Start loading
            if (usePageLoader) {
                setPageLoading(true, loadingMessage);
            } else if (usePDFLoader) {
                setPDFLoading(true, loadingMessage);
            } else if (loadingKey) {
                setLoading(loadingKey, true, loadingMessage);
            }

            // Execute operation
            const result = await operation();

            // Handle success
            if (onSuccess) onSuccess(result);

            return result;
        } catch (error) {
            // Handle error
            if (onError) onError(error);
            else console.error("Operation failed:", error);

            return null;
        } finally {
            // Stop loading
            if (usePageLoader) {
                setPageLoading(false);
            } else if (usePDFLoader) {
                setPDFLoading(false);
            } else if (loadingKey) {
                setLoading(loadingKey, false);
            }
        }
    };

    return { executeWithLoading };
};

// Pre-configured helpers for common operations
export const usePDFGeneration = () => {
    const { executeWithLoading } = useAsyncOperation();

    const generatePDF = async <T>(
        operation: () => Promise<T>,
        message = "Menghasilkan dokumen PDF...",
        showSuccessToast = true,
    ) => {
        return executeWithLoading(operation, {
            usePDFLoader: true,
            loadingMessage: message,
            onSuccess: () => {
                if (showSuccessToast) {
                    toast.success("PDF berhasil diunduh!");
                }
            },
            onError: (error) => {
                toast.error(
                    `Gagal mengunduh PDF: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
                );
            },
        });
    };

    return { generatePDF };
};

export const usePageOperation = () => {
    const { executeWithLoading } = useAsyncOperation();

    const executePageOperation = async <T>(
        operation: () => Promise<T>,
        message = "Memuat halaman...",
    ) => {
        return executeWithLoading(operation, {
            usePageLoader: true,
            loadingMessage: message,
        });
    };

    return { executePageOperation };
};

// Utility untuk delay (untuk testing)
export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
