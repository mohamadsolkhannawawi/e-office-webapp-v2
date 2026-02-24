"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-4xl">
                    <p className="text-center text-gray-600">
                        Memuat profil...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-4xl">
                    <p className="text-center text-gray-600">
                        Memuat profil...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Profil Saya
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Informasi akun Super Admin
                    </p>
                </div>

                {/* Profile Card */}
                <Card className="rounded-3xl border-gray-200 p-8 shadow-sm">
                    <div className="space-y-6">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-6">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-undip-blue text-white">
                                <User className="h-12 w-12" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h2>
                                <p className="text-gray-600">
                                    Super Administrator
                                </p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Email
                                    </p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Role
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles?.map((role: string) => (
                                            <span
                                                key={role}
                                                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 border-t pt-6">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.push("/super-admin/profil/edit")
                                }
                            >
                                Edit Profil
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.push(
                                        "/super-admin/profil/ubah-password",
                                    )
                                }
                            >
                                Ubah Password
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
