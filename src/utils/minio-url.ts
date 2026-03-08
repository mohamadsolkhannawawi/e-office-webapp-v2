/**
 * Rewrites a MinIO presigned URL that uses `localhost` to route through
 * the Next.js /minio-proxy path, so the browser can access it even when
 * MinIO is only reachable as `localhost` from the server.
 *
 * e.g. http://localhost:9000/e-office-srb/signature/file.png?X-Amz-...
 *   →  /minio-proxy/e-office-srb/signature/file.png?X-Amz-...
 */
export function rewriteMinioUrl(url: string | undefined | null): string {
    if (!url) return "";
    try {
        const parsed = new URL(url);
        if (
            parsed.hostname === "localhost" ||
            parsed.hostname === "127.0.0.1"
        ) {
            return `/minio-proxy${parsed.pathname}${parsed.search}`;
        }
    } catch {
        // Not a parseable URL, return as-is
    }
    return url;
}

/**
 * Same as rewriteMinioUrl but returns an absolute URL using window.location.origin.
 * Use this where relative paths are not supported (e.g. @react-pdf/renderer Image).
 */
export function rewriteMinioUrlAbsolute(
    url: string | undefined | null,
): string {
    const rewritten = rewriteMinioUrl(url);
    if (!rewritten) return "";
    if (rewritten.startsWith("/") && typeof window !== "undefined") {
        return `${window.location.origin}${rewritten}`;
    }
    return rewritten;
}
