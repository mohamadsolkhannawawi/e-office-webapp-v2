"use client";

import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FileText, Image as ImageIcon, X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilePreviewItem {
    name: string;
    type: string;
    size?: number;
    file?: File;
    url?: string;
}

interface FilePreviewProps {
    files: FilePreviewItem[];
    showPreviewByDefault?: boolean;
    onDelete?: (index: number) => void;
    readonly?: boolean;
}

export function FilePreview({
    files,
    showPreviewByDefault = true,
    onDelete,
    readonly = false,
}: FilePreviewProps) {
    const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(
        showPreviewByDefault ? new Set(files.map((_, i) => i)) : new Set()
    );
    const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

    const togglePreview = (index: number) => {
        const newSet = new Set(expandedPreviews);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setExpandedPreviews(newSet);
    };

    const getFileUrl = (file: FilePreviewItem): string => {
        if (file.url) return file.url;
        if (file.file) return URL.createObjectURL(file.file);
        return "";
    };

    const getFileType = (file: FilePreviewItem): "pdf" | "image" | "unknown" => {
        const name = file.name.toLowerCase();
        const type = file.type?.toLowerCase() || "";

        if (name.endsWith(".pdf") || type.includes("pdf")) return "pdf";
        if (
            name.endsWith(".jpg") ||
            name.endsWith(".png") ||
            type.includes("image")
        )
            return "image";
        return "unknown";
    };

    const formatSize = (size?: number) => {
        if (!size && size !== 0) return "-";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024)
            return `${(size / 1024).toFixed(1).replace(/\.0$/, "")} KB`;
        return `${(size / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
    };

    const imageFiles = files
        .map((file, index) => ({
            src: getFileUrl(file),
            alt: file.name,
            index,
        }))
        .filter((_, index) => getFileType(files[index]) === "image");

    return (
        <>
            <div className="space-y-4">
                {files.map((file, index) => {
                    const fileType = getFileType(file);
                    const fileUrl = getFileUrl(file);
                    const isExpanded = expandedPreviews.has(index);

                    return (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                        >
                            {/* File Header */}
                            <div className="flex items-center justify-between p-3 bg-gray-50">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                                        {fileType === "pdf" ? (
                                            <FileText className="w-5 h-5" />
                                        ) : (
                                            <ImageIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {fileType === "pdf"
                                                ? "PDF Document"
                                                : "Image"}{" "}
                                            • {formatSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => togglePreview(index)}
                                        className="text-xs p-2"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </Button>
                                    {!readonly && onDelete && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDelete(index)}
                                            className="text-xs"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Preview Content */}
                            {isExpanded && (
                                <div className="p-4 bg-white border-t border-gray-100">
                                    {fileType === "pdf" ? (
                                        <div className="w-full border border-gray-200 rounded">
                                            <iframe
                                                src={fileUrl}
                                                className="w-full h-[600px]"
                                                title={file.name}
                                            />
                                        </div>
                                    ) : fileType === "image" ? (
                                        <div
                                            className="cursor-pointer max-w-full"
                                            onClick={() => {
                                                const imgIndex = imageFiles.findIndex(
                                                    (img) => img.index === index
                                                );
                                                setLightboxIndex(imgIndex);
                                            }}
                                        >
                                            <img
                                                src={fileUrl}
                                                alt={file.name}
                                                className="max-w-full h-auto rounded border border-gray-200"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Preview tidak tersedia untuk tipe file ini
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Lightbox for Images */}
            <Lightbox
                open={lightboxIndex >= 0}
                close={() => setLightboxIndex(-1)}
                index={lightboxIndex}
                slides={imageFiles}
            />
        </>
    );
}
