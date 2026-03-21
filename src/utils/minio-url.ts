/**
 * Rewrites a MinIO presigned URL that uses `localhost` to route through
 * the Next.js /minio-proxy path, so the browser can access it even when
 * MinIO is only reachable as `localhost` from the server.
 *
 * e.g. http://localhost:9000/e-office-srb/signature/file.png?X-Amz-...
 *   →  /minio-proxy/e-office-srb/signature/file.png?X-Amz-...
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const PROXY_SEGMENT = "/minio-proxy";

function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  if (!BASE_PATH) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}

function extractProxyPath(pathname: string, search = ""): string | null {
  const idx = pathname.indexOf(PROXY_SEGMENT);
  if (idx < 0) return null;
  return `${pathname.slice(idx)}${search}`;
}

function normalizeApiPath(pathname: string, search = ""): string | null {
  if (pathname.startsWith("/api/")) return withBasePath(`${pathname}${search}`);
  if (BASE_PATH && pathname.startsWith(`${BASE_PATH}/api/`)) {
    return withBasePath(`${pathname.slice(BASE_PATH.length)}${search}`);
  }
  return null;
}

export function rewriteMinioUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Normalize relative proxy path (with or without basePath) when Next.js basePath is enabled.
  if (url.startsWith("/")) {
    const proxyPath = extractProxyPath(url);
    if (proxyPath) return withBasePath(proxyPath);

    const normalizedApi = normalizeApiPath(url);
    if (normalizedApi) return normalizedApi;
  }

  try {
    const parsed = new URL(url);

    // If backend already returns proxy URL (possibly with basePath), normalize it.
    const proxyPath = extractProxyPath(parsed.pathname, parsed.search);
    if (proxyPath) {
      return withBasePath(proxyPath);
    }

    const normalizedApi = normalizeApiPath(parsed.pathname, parsed.search);
    if (normalizedApi) return normalizedApi;

    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return withBasePath(`${PROXY_SEGMENT}${parsed.pathname}${parsed.search}`);
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
