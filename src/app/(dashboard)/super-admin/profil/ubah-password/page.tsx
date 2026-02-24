"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Key, Shield } from "lucide-react";

export default function ChangePasswordPage() {
    const router = useRouter();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-xl"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Ubah Password
                        </h1>
                    </div>
                    <p className="text-slate-500 text-lg ml-12">
                        Update password akun Anda
                    </p>
                </div>
            </div>

            {/* Coming Soon Card */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">
                        Form Ubah Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-undip-blue/10 mb-4">
                            <Lock className="h-8 w-8 text-undip-blue" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                            Fitur Dalam Pengembangan
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            Form ubah password sedang dalam tahap pengembangan.
                            Akan terintegrasi dengan Better Auth untuk keamanan
                            maksimal.
                        </p>
                        <div className="inline-flex flex-col gap-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                <span>Input password lama</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                <span>Input password baru</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Konfirmasi password baru</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
