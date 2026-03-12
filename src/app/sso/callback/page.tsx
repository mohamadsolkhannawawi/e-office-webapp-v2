"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function SSOCallbackComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [error, setError] = useState<string | null>(null);
    const [noRole, setNoRole] = useState(false);
    const { refreshSession, user } = useAuth();

    useEffect(() => {
        if (!token) {
            setError("Token SSO tidak ditemukan.");
            return;
        }

        const activate = async () => {
            try {
                // 1. Set httpOnly cookie
                const res = await fetch(
                    `/persuratan-rekomendasi/api/auth/sso/set-session?token=${encodeURIComponent(token)}`,
                    { credentials: "include" },
                );

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(
                        body.message || "Gagal mengaktifkan sesi SSO.",
                    );
                }

                // 2. Refresh session agar AuthContext mendapat user + roles
                await refreshSession();
            } catch (err: any) {
                setError(err.message || "Terjadi kesalahan saat proses SSO.");
            }
        };

        activate();
    }, [token]);

    // 3. Redirect ke dashboard — modal kelengkapan profil akan muncul di sana
    useEffect(() => {
        if (!user || !user.roles) return;

        const roles = user.roles.map((r) => r.toUpperCase());

        if (roles.includes("SUPER_ADMIN")) router.push("/super-admin");
        else if (roles.includes("MAHASISWA")) router.push("/mahasiswa");
        else if (roles.includes("SUPERVISOR")) router.push("/supervisor-akademik");
        else if (roles.includes("MANAJER_TU")) router.push("/manajer-tu");
        else if (roles.includes("WAKIL_DEKAN_1")) router.push("/wakil-dekan-1");
        else if (roles.includes("UPA")) router.push("/upa");
        else setNoRole(true);
    }, [user]);

    if (noRole) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="bg-white border border-yellow-200 p-8 rounded-xl shadow-sm max-w-md w-full text-center">
                    <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-lg font-semibold text-yellow-700 mb-2">
                        Akun Belum Memiliki Akses
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                        Login SSO berhasil, namun akun Anda belum mendapat role
                        di sistem ini.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Hubungi administrator untuk mendapatkan akses.
                    </p>
                    <button
                        onClick={() => router.replace("/login")}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="bg-white border border-red-200 p-8 rounded-xl shadow-sm max-w-md w-full text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-lg font-semibold text-red-700 mb-2">
                        Autentikasi SSO Gagal
                    </h2>
                    <p className="text-sm text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.replace("/login")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-sm">
                Mengonfirmasi identitas SSO...
            </p>
        </div>
    );
}

// Wajib dibungkus Suspense karena useSearchParams
export default function SSOCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            }
        >
            <SSOCallbackComponent />
        </Suspense>
    );
}
