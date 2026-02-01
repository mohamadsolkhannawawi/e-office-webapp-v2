"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { renderAsync } from "docx-preview";
import {
    Loader2,
    FileWarning,
    RefreshCw,
    FileText,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    fetchDocxForPreview,
    getDocxPreviewStatus,
    triggerDocxGeneration,
    type PreviewStatus,
} from "@/lib/template-api";

interface DocxPreviewProps {
    letterInstanceId: string;
    className?: string;
    onLoadComplete?: () => void;
    onError?: (error: Error) => void;
}

export function DocxPreview({
    letterInstanceId,
    className = "",
    onLoadComplete,
    onError,
}: DocxPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notGenerated, setNotGenerated] = useState(false);
    const [previewStatus, setPreviewStatus] = useState<PreviewStatus | null>(
        null,
    );
    const [retryTrigger, setRetryTrigger] = useState(0);

    const loadPreview = useCallback(async () => {
        // Don't check containerRef here - it may not be ready on first render
        // We'll check it later before rendering

        setLoading(true);
        setError(null);
        setNotGenerated(false);

        try {
            console.log(
                "🔄 [DocxPreview] Starting preview load for:",
                letterInstanceId,
            );

            // First check if preview is available
            const status = await getDocxPreviewStatus(letterInstanceId);
            console.log("📊 [DocxPreview] Preview status:", status);
            setPreviewStatus(status);

            if (!status.available) {
                if (status.reason === "not_generated") {
                    console.log("⚠️ [DocxPreview] Document not generated yet");
                    setNotGenerated(true);
                    setLoading(false);
                    return;
                }
                throw new Error(
                    status.reason === "file_missing"
                        ? "File dokumen tidak ditemukan. Silakan coba generate ulang."
                        : "Dokumen tidak tersedia untuk preview.",
                );
            }

            // Fetch DOCX file
            console.log("📥 [DocxPreview] Fetching DOCX file...");
            const arrayBuffer = await fetchDocxForPreview(letterInstanceId);
            console.log(
                "✅ [DocxPreview] DOCX fetched, size:",
                arrayBuffer.byteLength,
                "bytes",
            );

            // Check if container is ready for rendering
            if (!containerRef.current) {
                console.warn(
                    "⚠️ [DocxPreview] Container ref not ready, retrying...",
                );
                // Schedule a retry after a short delay
                setTimeout(() => setRetryTrigger((prev) => prev + 1), 100);
                return;
            }

            // Clear previous content
            containerRef.current.innerHTML = "";

            // Render DOCX preview with timeout
            console.log("🎨 [DocxPreview] Starting renderAsync...");
            const renderPromise = renderAsync(
                arrayBuffer,
                containerRef.current,
                undefined,
                {
                    className: "docx-preview-content",
                    inWrapper: true,
                    ignoreWidth: true, // Use container width for flexibility
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: true,
                    experimental: false, // Disable experimental for stability
                    trimXmlDeclaration: true,
                    useBase64URL: true,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    renderEndnotes: true,
                },
            );

            // Add 30 second timeout for large files
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                "Render timeout - file mungkin terlalu besar",
                            ),
                        ),
                    30000,
                ),
            );

            await Promise.race([renderPromise, timeoutPromise]);
            console.log("✅ [DocxPreview] Render complete!");

            setLoading(false);
            onLoadComplete?.();
        } catch (err) {
            console.error("❌ [DocxPreview] Error:", err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Gagal memuat preview dokumen";
            setError(errorMessage);
            setLoading(false);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
    }, [letterInstanceId, onLoadComplete, onError]);

    // Handle on-demand generation
    const handleGenerateDocument = useCallback(async () => {
        setGenerating(true);
        setError(null);

        try {
            const result = await triggerDocxGeneration(letterInstanceId);
            if (result.success) {
                // Generation successful, trigger reload
                setNotGenerated(false);
                setGenerating(false);
                // Trigger loadPreview via state change
                setRetryTrigger((prev) => prev + 1);
            } else {
                throw new Error(result.error || "Gagal generate dokumen");
            }
        } catch (err) {
            setGenerating(false);
            setError(
                err instanceof Error ? err.message : "Gagal generate dokumen",
            );
        }
    }, [letterInstanceId]);

    useEffect(() => {
        loadPreview();
    }, [loadPreview, retryTrigger]);

    return (
        <div className={`relative ${className}`}>
            {/* Loading State Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200 h-150">
                    <Loader2 className="h-10 w-10 animate-spin text-undip-blue mb-4" />
                    <p className="text-sm font-medium text-slate-600">
                        Memuat preview dokumen...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Mengenerate dokumen DOCX dari template
                    </p>
                </div>
            )}

            {/* ERROR State */}
            {!loading && error && (
                <div className="flex flex-col items-center justify-center h-150 bg-slate-50 rounded-lg border border-slate-200">
                    <FileWarning className="h-12 w-12 text-amber-500 mb-4" />
                    <p className="text-sm font-medium text-slate-700 mb-2">
                        Preview Tidak Tersedia
                    </p>
                    <p className="text-xs text-slate-500 text-center max-w-md px-4 mb-4">
                        {error}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadPreview}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Coba Lagi
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleGenerateDocument}
                            disabled={generating}
                            className="gap-2 bg-undip-blue hover:bg-undip-blue/90"
                        >
                            <Sparkles className="h-4 w-4" />
                            Generate Ulang
                        </Button>
                    </div>
                </div>
            )}

            {/* NOT GENERATED State */}
            {!loading && notGenerated && (
                <div className="flex flex-col items-center justify-center h-150 bg-slate-50 rounded-lg border border-slate-200">
                    {generating ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-undip-blue mb-4" />
                            <p className="text-sm font-medium text-slate-600">
                                Generating dokumen...
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Mohon tunggu, dokumen sedang dibuat dari
                                template
                            </p>
                        </>
                    ) : (
                        <>
                            <FileText className="h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-sm font-medium text-slate-700 mb-2">
                                Dokumen Belum Tersedia
                            </p>
                            <p className="text-xs text-slate-500 text-center max-w-md px-4 mb-4">
                                Dokumen belum di-generate. Klik tombol di bawah
                                untuk membuat dokumen dari template.
                            </p>
                            <Button
                                onClick={handleGenerateDocument}
                                disabled={generating}
                                className="gap-2 bg-undip-blue hover:bg-undip-blue/90"
                            >
                                <Sparkles className="h-4 w-4" />
                                Generate Dokumen
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* SUCCESS State: DOCX Preview Header */}
            {!loading && !error && !notGenerated && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-slate-100 to-transparent px-4 py-2 flex items-center gap-2 pointer-events-none">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-600">
                        Preview Dokumen DOCX
                    </span>
                    {previewStatus?.generatedAt && (
                        <span className="text-xs text-slate-400 ml-auto">
                            Generated:{" "}
                            {new Date(previewStatus.generatedAt).toLocaleString(
                                "id-ID",
                            )}
                        </span>
                    )}
                </div>
            )}

            {/* DOCX Preview Container - ALWAYS RENDERED but can be hidden */}
            <div
                ref={containerRef}
                className={`docx-preview-container bg-white shadow-lg rounded-lg overflow-auto ${
                    loading || error || notGenerated ? "hidden" : "block"
                }`}
                style={{
                    minHeight: "800px",
                    maxHeight: "calc(100vh - 200px)",
                }}
            />

            {/* Custom styles for docx-preview */}
            <style jsx global>{`
                .docx-preview-container {
                    padding-top: 40px;
                }

                .docx-preview-container .docx-wrapper {
                    background: #f1f5f9;
                    padding: 40px;
                    display: flex;
                    justify-content: center;
                }

                .docx-preview-container .docx-wrapper > section.docx {
                    box-shadow:
                        0 20px 25px -5px rgba(0, 0, 0, 0.1),
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    margin: 0 auto;
                    background: white;
                    /* width and min-height removed to allow natural DOCX proportions */
                    max-width: 100%;
                }

                /* Ensure images in headers and content are not clipped */
                .docx-preview-container .docx-wrapper img {
                    max-width: none !important;
                }

                /* Print styles - Critical for high quality PDF */
                @media print {
                    .docx-preview-container {
                        padding-top: 0 !important;
                        display: block !important;
                        background: white !important;
                        overflow: visible !important;
                        height: auto !important;
                        width: 100% !important;
                    }

                    .docx-preview-container .docx-wrapper {
                        padding: 0 !important;
                        background: white !important;
                        display: block !important;
                        width: 100% !important;
                    }

                    .docx-preview-container .docx-wrapper > section.docx {
                        box-shadow: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
}

export default DocxPreview;
