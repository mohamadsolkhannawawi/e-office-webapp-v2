"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, RefreshCw } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { type User } from "@/contexts/AuthContext";

// Helper to determine redirect path purely from user state
function getRedirectPath(user: User | null): string | null {
    if (!user || !user.roles || user.roles.length === 0) return null;
    const roles = user.roles.map((r: string) => r.toUpperCase());

    if (roles.includes("MAHASISWA")) return "/mahasiswa";
    if (roles.includes("SUPERVISOR")) return "/supervisor-akademik";
    if (roles.includes("MANAJER_TU")) return "/manajer-tu";
    if (roles.includes("WAKIL_DEKAN_1")) return "/wakil-dekan-1";
    if (roles.includes("UPA")) return "/upa";
    return null;
}

export default function DashboardFallbackPage() {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();

    // Calculate redirect path during render
    // If isLoading is false and user is present, we check for a valid role path
    const redirectPath = !isLoading ? getRedirectPath(user) : null;

    useEffect(() => {
        // Perform the redirect as a side effect if a path is identified
        if (redirectPath) {
            router.replace(redirectPath);
        }
    }, [redirectPath, router]);

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    // Show loading spinner if:
    // 1. Auth is still loading
    // 2. We have identified a redirect path and are waiting for the router to push (useEffect)
    if (isLoading || redirectPath) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">
                        Memuat sesi...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <Card className="w-full max-w-md border-red-200 shadow-lg dark:border-red-900">
                <CardHeader className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                        <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Sesi Berakhir
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        Sesi Anda telah habis atau akun Anda tidak memiliki
                        akses ke halaman ini. Ini adalah langkah keamanan untuk
                        melindungi akun Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>
                        Silakan login kembali untuk melanjutkan aktivitas Anda.
                    </p>
                    {user && (
                        <div className="mt-4 rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                            Akun:{" "}
                            <span className="font-mono">{user.email}</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <Button
                        onClick={handleLogout}
                        className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                        size="lg"
                    >
                        <LogOut className="h-4 w-4" />
                        Login Kembali
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
