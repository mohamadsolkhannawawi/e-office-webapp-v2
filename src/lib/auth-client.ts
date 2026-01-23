import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client for Frontend
 * Configured to connect to backend via Next.js Proxy (port 3000 -> 3005)
 * Better Auth will automatically append basePath (/api/auth) from server config
 */
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // Use Frontend URL to leverage Next.js Rewrite Proxy
});

/**
 * Auth helper functions
 */
export const auth = {
    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        return await authClient.signIn.email({
            email,
            password,
        });
    },

    // Sign out
    signOut: async () => {
        return await authClient.signOut();
    },

    // Get current session
    getSession: async () => {
        return await authClient.getSession();
    },

    // Sign up (register)
    signUp: async (email: string, password: string, name: string) => {
        return await authClient.signUp.email({
            email,
            password,
            name,
        });
    },
};
