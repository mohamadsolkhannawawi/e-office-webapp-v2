import { treaty } from "@elysiajs/eden";
import type { App } from "@backend/autogen.routes.ts";

/**
 * API client configured to:
 * - Send cookies automatically (credentials: "include")
 * - Use relative URLs for Next.js Rewrite proxy
 */
export const client = treaty<App>("http://localhost:3000", {
    credentials: "include", // Enable sending cookies with requests
    fetch: {
        credentials: "include", // Also set in fetch options
    },
});
