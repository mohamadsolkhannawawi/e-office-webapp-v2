"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardFallbackPage() {
    const { user, session, isLoading, signOut } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Loading session...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-10">
            <h1 className="mb-6 text-3xl font-bold text-red-600">
                Dashboard Fallback
            </h1>
            <p className="mb-4 text-gray-700">
                Anda diarahkan ke halaman ini karena sistem tidak menemukan role
                spesifik pada akun Anda atau terjadi kesalahan redirect.
            </p>

            <div className="mb-8 rounded-lg border bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Debug Info</h2>
                <div className="space-y-2">
                    <p>
                        <strong>Nama:</strong> {user?.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                        <strong>User ID:</strong> {user?.id}
                    </p>
                    <p>
                        <strong>Roles (Session):</strong>{" "}
                        {user?.roles?.length
                            ? user.roles.join(", ")
                            : "TIDAK ADA ROLE DETECTED"}
                    </p>
                    <pre className="mt-4 max-h-60 overflow-auto rounded bg-gray-100 p-4 text-xs">
                        {JSON.stringify({ user, session }, null, 2)}
                    </pre>
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()}>
                    Refresh Page
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        // Manual redirect test
                        if (user?.roles?.includes("MAHASISWA")) {
                            router.push("/mahasiswa");
                        }
                    }}
                >
                    Try Force Redirect /mahasiswa
                </Button>
                <Button variant="destructive" onClick={() => signOut()}>
                    Logout
                </Button>
            </div>
        </div>
    );
}
