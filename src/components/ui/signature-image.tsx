"use client";
/* eslint-disable @next/next/no-img-element */

import React, { ImgHTMLAttributes, useState } from "react";

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
    fallbackSrc = "/assets/signature-dummy.png",
    ...props
}: SignatureImageProps) {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
        }
    };

    const imgSrc = hasError ? fallbackSrc : src;

    // If it's a local asset, keep it as-is
    if (src.startsWith("/assets/")) {
        return <img src={src} alt={alt} className={className} {...props} />;
    }

    // For external URLs (MinIO presigned URLs), use direct img tag
    // This avoids Next.js Image optimization issues with complex query strings
    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            loading="lazy"
            onError={handleError}
            {...props}
        />
    );
}
