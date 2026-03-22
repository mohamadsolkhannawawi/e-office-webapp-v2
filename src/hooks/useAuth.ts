"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

/**
 * Custom hook untuk mengakses auth context
 * Harus digunakan di dalam AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Re-export AuthContext untuk akses langsung jika diperlukan
export { AuthContext } from "@/contexts/AuthContext";
