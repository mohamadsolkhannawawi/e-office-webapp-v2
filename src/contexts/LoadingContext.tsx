"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { PageLoader, PDFLoader } from "@/components/ui/loader";

interface LoadingContextType {
    // Page loading
    isPageLoading: boolean;
    setPageLoading: (loading: boolean, message?: string) => void;
    pageLoadingMessage: string;

    // PDF generation loading
    isPDFLoading: boolean;
    setPDFLoading: (loading: boolean, message?: string) => void;
    pdfLoadingMessage: string;

    // Generic loading states
    loadingStates: Record<string, { loading: boolean; message?: string }>;
    setLoading: (key: string, loading: boolean, message?: string) => void;
    isLoading: (key: string) => boolean;
    getLoadingMessage: (key: string) => string | undefined;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [pageLoadingMessage, setPageLoadingMessage] =
        useState("Memuat halaman...");

    const [isPDFLoading, setIsPDFLoading] = useState(false);
    const [pdfLoadingMessage, setPdfLoadingMessage] = useState(
        "Menghasilkan dokumen PDF...",
    );

    const [loadingStates, setLoadingStates] = useState<
        Record<string, { loading: boolean; message?: string }>
    >({});

    const setPageLoading = (loading: boolean, message?: string) => {
        setIsPageLoading(loading);
        if (message) setPageLoadingMessage(message);
    };

    const setPDFLoading = (loading: boolean, message?: string) => {
        setIsPDFLoading(loading);
        if (message) setPdfLoadingMessage(message);
    };

    const setLoading = (key: string, loading: boolean, message?: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [key]: { loading, message },
        }));
    };

    const isLoading = (key: string) => {
        return loadingStates[key]?.loading || false;
    };

    const getLoadingMessage = (key: string) => {
        return loadingStates[key]?.message;
    };

    const value: LoadingContextType = {
        isPageLoading,
        setPageLoading,
        pageLoadingMessage,
        isPDFLoading,
        setPDFLoading,
        pdfLoadingMessage,
        loadingStates,
        setLoading,
        isLoading,
        getLoadingMessage,
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}

            {/* Global Loaders */}
            {isPageLoading && <PageLoader message={pageLoadingMessage} />}
            {isPDFLoading && <PDFLoader message={pdfLoadingMessage} />}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

// Custom hooks for specific loading types
export const usePageLoading = () => {
    const { isPageLoading, setPageLoading, pageLoadingMessage } = useLoading();
    return { isPageLoading, setPageLoading, pageLoadingMessage };
};

export const usePDFLoading = () => {
    const { isPDFLoading, setPDFLoading, pdfLoadingMessage } = useLoading();
    return { isPDFLoading, setPDFLoading, pdfLoadingMessage };
};

// Generic loading hook
export const useCustomLoading = (key: string) => {
    const { setLoading, isLoading, getLoadingMessage } = useLoading();

    const loading = isLoading(key);
    const message = getLoadingMessage(key);

    const setLoadingState = (loading: boolean, message?: string) => {
        setLoading(key, loading, message);
    };

    return { loading, message, setLoading: setLoadingState };
};
