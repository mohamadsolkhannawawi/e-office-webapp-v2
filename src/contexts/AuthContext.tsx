"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import type { Session, User as BetterAuthUser } from "better-auth/types";

// Perluas tipe User Better Auth agar mendukung roles
export interface User extends BetterAuthUser {
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ user: User; session: Session } | undefined>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Ambil session saat komponen pertama kali dimuat (hanya sisi klien)
  useEffect(() => {
    setMounted(true);
    refreshSession();
  }, []);

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.getSession();

      console.log(">>> AUTH CONTEXT RAW SESSION DATA:", data);
      if (data?.user) {
        console.log(">>> AUTH CONTEXT USER ROLES:", (data.user as User).roles);
      }

      if (error || !data) {
        setUser(null);
        setSession(null);
      } else {
        setUser(data.user as User);
        setSession(data.session as Session);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      console.error(">>> Sign-in error:", error);

      // Ambil pesan error dari berbagai format yang mungkin
      let errorMessage = "Login failed";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "object" && "error" in error) {
        // Tangani respons JSON backend dengan field "error"
        errorMessage = (error as any).error;
      }

      throw new Error(errorMessage);
    }

    if (data) {
      setUser(data.user as User);
      if ("session" in data) {
        setSession(data.session as Session);
      }
      return data as unknown as { user: User; session: Session };
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setSession(null);
      // Set flag untuk menampilkan notifikasi di login page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("logout_success", "true");
      }
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Cadangan: kosongkan state dan tetap redirect
      setUser(null);
      setSession(null);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("logout_success", "true");
      }
      router.push("/login");
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
