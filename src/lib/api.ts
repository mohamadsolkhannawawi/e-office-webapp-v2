import { treaty } from "@elysiajs/eden";

/**
 * API client configured to:
 * - Send cookies automatically (credentials: "include")
 * - Connect to backend API
 *
 * Note: Using untyped client as backend is deployed separately
 */
export const client = treaty(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    {
        fetch: {
            credentials: "include", // Enable sending cookies with requests
        },
    },
);
