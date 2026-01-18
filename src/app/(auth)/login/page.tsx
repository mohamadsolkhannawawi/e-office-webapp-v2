"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import logoMain from "@/assets/images/logo-undip-main.png";

import { Navbar } from "@/components/layout/Navbar";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-bg-light font-sans text-gray-800 antialiased dark:bg-bg-dark dark:text-gray-200">
            <Navbar showProfile={false} />

            {/* Main Content */}
            <main className="flex flex-grow items-center justify-center p-4 md:p-6">
                <div className="flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-card-light shadow-xl dark:bg-card-dark md:flex-row">
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

                        <form action="#" method="POST" className="space-y-5">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Username atau Email
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Contoh: budi@students.undip.ac.id"
                                        className="h-12 pl-10"
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
                                        placeholder="Contoh: 123456"
                                        className="h-12 pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                                type="button"
                                className="w-full bg-dark-navy py-6 text-white hover:bg-slate-800"
                            >
                                Masuk
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow">
                                    <Separator />
                                </div>
                                <span className="mx-4 flex-shrink-0 text-sm text-gray-400 dark:text-gray-500">
                                    atau
                                </span>
                                <div className="flex-grow">
                                    <Separator />
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                className="w-full border-gray-300 py-6 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                    © 2025 UP2TI FSM UNDIP. Seluruh Hak Cipta Dilindungi
                    Undang-Undang.
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
