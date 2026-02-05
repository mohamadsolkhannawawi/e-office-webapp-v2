"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import logoMain from "@/assets/images/logo-undip-main.png";

import { Navbar } from "@/components/layout/Navbar";
import { useAuth, type User as AuthUser } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        signIn,
        user: currentUser,
        isAuthenticated,
        isLoading: authLoading,
        refreshSession, // Add this
    } = useAuth();

    // AuthClient is already imported from context or lib, but we need it here for direct usage
    // Import directly at top level is better, let's use the one from @/lib/auth-client
    const router = useRouter();

    // Redirection helper
    const redirectToDashboard = React.useCallback(
        (user: AuthUser) => {
            console.log("Redirect helper called with:", user);
            const roles = (user.roles || []).map((r) => r.toUpperCase());
            console.log("User roles found (normalized):", roles);

            if (roles.includes("MAHASISWA")) {
                router.push("/mahasiswa");
            } else if (roles.includes("SUPERVISOR")) {
                router.push("/supervisor-akademik");
            } else if (roles.includes("MANAJER_TU")) {
                router.push("/manajer-tu");
            } else if (roles.includes("WAKIL_DEKAN_1")) {
                router.push("/wakil-dekan-1");
            } else if (roles.includes("UPA")) {
                router.push("/upa");
            } else {
                console.warn(
                    "No matching role found, falling back to /dashboard",
                );
                router.push("/dashboard");
            }
        },
        [router],
    );

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (!authLoading && isAuthenticated && currentUser) {
            redirectToDashboard(currentUser);
        }
    }, [isAuthenticated, currentUser, authLoading, redirectToDashboard]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Email dan password harus diisi");
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);
            toast.success("Login berhasil!");

            // FETCH LATEST SESSION TO GET ROLES (Manual Handler only intercepts getSession)
            await refreshSession();

            // Get the updated user from context manually or via a helper if needed.
            // Since refreshSession updates the context state, we might need to wait for it or fetch directly.
            // Let's fetch directly to be safe and fast.
            const sessionData = await authClient.getSession();

            if (sessionData.data?.user) {
                redirectToDashboard(sessionData.data.user as AuthUser);
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Login gagal. Periksa email dan password Anda.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-bg-light font-sans text-gray-800 antialiased dark:bg-bg-dark dark:text-gray-200">
            <Toaster position="top-right" />
            <Navbar showProfile={false} />

            {/* Main Content */}
            <main className="flex grow items-center justify-center p-4 md:p-6">
                <div className="flex min-h-150 w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-card-light shadow-xl dark:bg-card-dark md:flex-row">
                    {/* Left Panel */}
                    <div className="flex w-full flex-col items-center justify-center border-b border-gray-100 p-8 text-center dark:border-gray-700 dark:bg-gray-900 md:w-1/2 md:border-b-0 md:border-r md:p-12">
                        <div className="relative mb-6 h-48 w-48 md:h-56 md:w-56">
                            <Image
                                src={logoMain}
                                alt="Diponegoro University Emblem"
                                fill
                                className="object-contain drop-shadow-sm"
                                priority
                            />
                        </div>
                        <h1 className="mb-4 text-3xl font-bold text-dark-navy dark:text-white">
                            FSM UNDIP SSO
                        </h1>
                        <p className="max-w-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            Selamat datang di Portal Aplikasi UNDIP FSM. Silakan
                            masuk untuk mengakses dasbor Anda.
                        </p>
                    </div>

                    {/* Right Panel - Sign In Form */}
                    <div className="flex w-full flex-col justify-center bg-card-light p-8 dark:bg-card-dark md:w-1/2 md:p-12">
                        <div className="mb-8">
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                Masuk
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Masukkan kredensial Anda untuk mengakses akun
                                Anda.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Contoh: mahasiswa@students.undip.ac.id"
                                        className="h-12 pl-10 rounded-3xl"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Kata Sandi
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Masukkan kata sandi"
                                        className="h-12 pl-10 pr-10 rounded-3xl"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    href="#"
                                    className="text-sm font-medium text-undip-blue hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                >
                                    Lupa Kata Sandi?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-dark-navy py-6 text-white hover:bg-slate-800 rounded-3xl"
                                disabled={isLoading}
                            >
                                {isLoading ? "Memproses..." : "Masuk"}
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="grow">
                                    <Separator />
                                </div>
                                <span className="mx-4 shrink-0 text-sm text-gray-400 dark:text-gray-500">
                                    atau
                                </span>
                                <div className="grow">
                                    <Separator />
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                className="w-full border-gray-300 py-6 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 rounded-3xl"
                                disabled={isLoading}
                            >
                                Masuk dengan SSO UNDIP
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="flex w-full flex-col items-center justify-between px-6 py-6 text-xs text-gray-500 dark:text-gray-400 md:flex-row">
                <p className="mb-2 md:mb-0">
                    © {new Date().getFullYear()} UP2TI FSM UNDIP. Seluruh Hak
                    Cipta Dilindungi Undang-Undang.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="#"
                        className="transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Bantuan
                    </Link>
                </div>
            </footer>
        </div>
    );
}
