/**
 * Toast Helper Utilities
 * Provides consistent toast notifications across the application
 *
 * Design Guidelines:
 * - Rounded corners (borderRadius: 12px) - tidak lancip/siku-siku
 * - Konsisten warna: Hijau (success), Oranye (warning), Merah (error)
 * - Teks jelas dan mendeskripsikan notifikasi dengan detail
 * - Setiap aksi tombol memiliki alert spesifik
 */

import toast from "react-hot-toast";

/**
 * Success notification - Warna hijau cerah
 * Digunakan untuk: Login berhasil, data tersimpan, upload sukses, dll
 */
export const showSuccess = (message: string) => {
    return toast.success(message, {
        style: {
            background: "#10b981", // Green 500
            color: "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            minWidth: "400px",
            minHeight: "80px",
            padding: "16px",
        },
        iconTheme: {
            primary: "white",
            secondary: "#10b981",
        },
        duration: 4000,
    });
};

/**
 * Error notification - Warna merah
 * Digunakan untuk: Login gagal, validasi error, sistem error, dll
 */
export const showError = (message: string) => {
    return toast.error(message, {
        style: {
            background: "#ef4444", // Red 500
            color: "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            minWidth: "400px",
            minHeight: "80px",
            padding: "16px",
        },
        iconTheme: {
            primary: "white",
            secondary: "#ef4444",
        },
        duration: 5000, // Error messages shown slightly longer
    });
};

/**
 * Warning notification - Warna oranye cerah
 * Digunakan untuk: Peringatan, konfirmasi diperlukan, perhatian khusus, dll
 */
export const showWarning = (message: string) => {
    return toast(message, {
        icon: "⚠️",
        style: {
            background: "#f97316", // Orange 500
            color: "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            minWidth: "400px",
            minHeight: "80px",
            padding: "16px",
        },
        duration: 5000,
    });
};

/**
 * Loading notification - Warna biru
 * Digunakan untuk: Proses sedang berjalan, menunggu response, dll
 */
export const showLoading = (message: string) => {
    return toast.loading(message, {
        style: {
            background: "#3b82f6", // Blue 500
            color: "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            minWidth: "400px",
            minHeight: "80px",
            padding: "16px",
        },
    });
};

/**
 * Info notification - Warna biru muda
 * Digunakan untuk: Informasi umum, tips, notifikasi netral, dll
 */
export const showInfo = (message: string) => {
    return toast(message, {
        icon: "ℹ️",
        style: {
            background: "#06b6d4", // Cyan 500
            color: "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            minWidth: "400px",
            minHeight: "80px",
            padding: "16px",
        },
        duration: 4000,
    });
};

/**
 * Promise-based toast for async operations
 * Automatically shows loading, success, or error based on promise result
 */
export const showPromise = <T>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error: string;
    },
) => {
    return toast.promise(
        promise,
        {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        },
        {
            style: {
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                minWidth: "400px",
                minHeight: "80px",
                padding: "16px",
            },
            success: {
                style: {
                    background: "#10b981",
                    color: "white",
                },
                iconTheme: {
                    primary: "white",
                    secondary: "#10b981",
                },
            },
            error: {
                style: {
                    background: "#ef4444",
                    color: "white",
                },
                iconTheme: {
                    primary: "white",
                    secondary: "#ef4444",
                },
            },
            loading: {
                style: {
                    background: "#3b82f6",
                    color: "white",
                },
            },
        },
    );
};

/**
 * Custom toast with full control over styling
 */
export const showCustom = (
    message: string,
    options?: {
        icon?: string;
        backgroundColor?: string;
        textColor?: string;
        duration?: number;
    },
) => {
    return toast(message, {
        icon: options?.icon,
        style: {
            background: options?.backgroundColor || "#3b82f6",
            color: options?.textColor || "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            minWidth: "400px",
            minHeight: "80px",
            padding: "16px",
        },
        duration: options?.duration || 4000,
    });
};
