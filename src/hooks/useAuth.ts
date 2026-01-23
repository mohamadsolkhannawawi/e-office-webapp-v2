"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Re-export AuthContext for direct access if needed
export { AuthContext } from "@/contexts/AuthContext";
