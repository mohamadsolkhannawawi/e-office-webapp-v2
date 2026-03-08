"use client";
/* eslint-disable @next/next/no-img-element */

import React, { ImgHTMLAttributes, useState } from "react";
import { rewriteMinioUrl } from "@/utils/minio-url";

interface SignatureImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

/**
 * Signature Image Component
 * Uses native <img> instead of Next.js Image to avoid optimization issues with presigned URLs
 * Signatures are static images that don't need optimization
 */
export function SignatureImage({
    src,
    alt,
    className = "object-contain mix-blend-multiply",
    fallbackSrc,
    ...props
}: SignatureImageProps) {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
        }
    };

    // Rewrite localhost MinIO URLs to go through the /minio-proxy Next.js route
    const resolvedSrc = rewriteMinioUrl(src);

    // If no valid src or error loading, don't render anything
    if (!resolvedSrc || hasError) {
        if (fallbackSrc) {
            return (
                <img
                    src={fallbackSrc}
                    alt={alt}
                    className={className}
                    {...props}
                />
            );
        }
        return null;
    }

    // For external URLs (MinIO presigned URLs), use direct img tag
    // This avoids Next.js Image optimization issues with complex query strings
    return (
        <img
            src={resolvedSrc}
            alt={alt}
            className={className}
            loading="lazy"
            onError={handleError}
            {...props}
        />
    );
}
