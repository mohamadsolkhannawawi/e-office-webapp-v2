"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    KeyRound,
    ShieldCheck,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChangePasswordFormProps {
    /** The URL to redirect back to (e.g. "/mahasiswa/profile") */
    backHref: string;
}

interface PasswordStrength {
    score: number; // 0-4
    label: string;
    color: string;
    barColor: string;
}

function getPasswordStrength(password: string): PasswordStrength {
    if (!password) {
        return {
            score: 0,
            label: "",
            color: "text-slate-400",
            barColor: "bg-slate-200",
        };
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const clampedScore = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

    const map: Record<
        0 | 1 | 2 | 3 | 4,
        { label: string; color: string; barColor: string }
    > = {
        0: {
            label: "Terlalu pendek",
            color: "text-red-500",
            barColor: "bg-red-400",
        },
        1: {
            label: "Lemah",
            color: "text-red-500",
            barColor: "bg-red-400",
        },
        2: {
            label: "Cukup",
            color: "text-amber-500",
            barColor: "bg-amber-400",
        },
        3: {
            label: "Kuat",
            color: "text-emerald-600",
            barColor: "bg-emerald-400",
        },
        4: {
            label: "Sangat Kuat",
            color: "text-emerald-700",
            barColor: "bg-emerald-500",
        },
    };

    return { score: clampedScore, ...map[clampedScore] };
}

interface FieldState {
    value: string;
    show: boolean;
    error: string;
}

const initialField: FieldState = { value: "", show: false, error: "" };

export default function ChangePasswordForm({
    backHref,
}: ChangePasswordFormProps) {
    const router = useRouter();
    const [current, setCurrent] = useState<FieldState>(initialField);
    const [newPwd, setNewPwd] = useState<FieldState>(initialField);
    const [confirm, setConfirm] = useState<FieldState>(initialField);
    const [loading, setLoading] = useState(false);

    const strength = getPasswordStrength(newPwd.value);

    // ── Validation helpers ────────────────────────────────────────────────────

    const validateCurrentPassword = useCallback((val: string) => {
        if (!val) return "Password lama wajib diisi.";
        return "";
    }, []);

    const validateNewPassword = useCallback((val: string, currVal: string) => {
        if (!val) return "Password baru wajib diisi.";
        if (val.length < 8) return "Minimal 8 karakter.";
        if (currVal && val === currVal)
            return "Password baru tidak boleh sama dengan password lama.";
        return "";
    }, []);

    const validateConfirmPassword = useCallback(
        (val: string, newVal: string) => {
            if (!val) return "Konfirmasi password wajib diisi.";
            if (val !== newVal) return "Konfirmasi password tidak cocok.";
            return "";
        },
        [],
    );

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleCurrentChange = (val: string) => {
        setCurrent((p) => ({
            ...p,
            value: val,
            error: validateCurrentPassword(val),
        }));
    };

    const handleNewChange = (val: string) => {
        setNewPwd((p) => ({
            ...p,
            value: val,
            error: validateNewPassword(val, current.value),
        }));
        // Re-validate confirm if already touched
        if (confirm.value) {
            setConfirm((p) => ({
                ...p,
                error: validateConfirmPassword(p.value, val),
            }));
        }
    };

    const handleConfirmChange = (val: string) => {
        setConfirm((p) => ({
            ...p,
            value: val,
            error: validateConfirmPassword(val, newPwd.value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation sweep
        const currErr = validateCurrentPassword(current.value);
        const newErr = validateNewPassword(newPwd.value, current.value);
        const confErr = validateConfirmPassword(confirm.value, newPwd.value);

        setCurrent((p) => ({ ...p, error: currErr }));
        setNewPwd((p) => ({ ...p, error: newErr }));
        setConfirm((p) => ({ ...p, error: confErr }));

        if (currErr || newErr || confErr) return;

        setLoading(true);

        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: current.value,
                    newPassword: newPwd.value,
                    confirmPassword: confirm.value,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    toast.error(
                        json.message ||
                            "Terlalu banyak percobaan. Coba lagi nanti.",
                    );
                    return;
                }
                if (res.status === 401 && json.error === "Wrong Password") {
                    setCurrent((p) => ({
                        ...p,
                        error: "Password lama yang Anda masukkan salah.",
                    }));
                    toast.error("Password lama salah.");
                    return;
                }
                toast.error(
                    json.message || "Gagal mengubah password. Coba lagi.",
                );
                return;
            }

            toast.success("Password berhasil diubah!");
            // Reset form
            setCurrent(initialField);
            setNewPwd(initialField);
            setConfirm(initialField);
            // Navigate back after short delay
            setTimeout(() => router.push(backHref), 1200);
        } catch {
            toast.error("Terjadi kesalahan jaringan. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const allFilled = current.value && newPwd.value && confirm.value;
    const hasErrors = !!current.error || !!newPwd.error || !!confirm.error;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(backHref)}
                    className="rounded-xl"
                    type="button"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Ubah Password
                    </h1>
                    <p className="text-slate-500 mt-0.5">
                        Perbarui password akun Anda untuk keamanan yang lebih
                        baik.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Form Card ──────────────────────────────────────────── */}
                    <Card className="lg:col-span-2 border border-gray-200 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-undip-blue" />
                                Formulir Ubah Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="currentPassword"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Password Lama{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="currentPassword"
                                        type={
                                            current.show ? "text" : "password"
                                        }
                                        value={current.value}
                                        onChange={(e) =>
                                            handleCurrentChange(e.target.value)
                                        }
                                        placeholder="Masukkan password lama"
                                        className={`pl-10 pr-10 rounded-xl h-11 ${
                                            current.error
                                                ? "border-red-400 focus-visible:ring-red-300"
                                                : ""
                                        }`}
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() =>
                                            setCurrent((p) => ({
                                                ...p,
                                                show: !p.show,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {current.show ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {current.error && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <XCircle className="h-3.5 w-3.5" />
                                        {current.error}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="newPassword"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Password Baru{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="newPassword"
                                        type={newPwd.show ? "text" : "password"}
                                        value={newPwd.value}
                                        onChange={(e) =>
                                            handleNewChange(e.target.value)
                                        }
                                        placeholder="Minimal 8 karakter"
                                        className={`pl-10 pr-10 rounded-xl h-11 ${
                                            newPwd.error
                                                ? "border-red-400 focus-visible:ring-red-300"
                                                : ""
                                        }`}
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() =>
                                            setNewPwd((p) => ({
                                                ...p,
                                                show: !p.show,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {newPwd.show ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {newPwd.value && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                                        i <= strength.score
                                                            ? strength.barColor
                                                            : "bg-slate-200"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p
                                            className={`text-xs font-medium ${strength.color}`}
                                        >
                                            Kekuatan: {strength.label}
                                        </p>
                                    </div>
                                )}
                                {newPwd.error && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <XCircle className="h-3.5 w-3.5" />
                                        {newPwd.error}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Konfirmasi Password Baru{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={
                                            confirm.show ? "text" : "password"
                                        }
                                        value={confirm.value}
                                        onChange={(e) =>
                                            handleConfirmChange(e.target.value)
                                        }
                                        placeholder="Ulangi password baru"
                                        className={`pl-10 pr-10 rounded-xl h-11 ${
                                            confirm.error
                                                ? "border-red-400 focus-visible:ring-red-300"
                                                : confirm.value &&
                                                    !confirm.error
                                                  ? "border-emerald-400 focus-visible:ring-emerald-300"
                                                  : ""
                                        }`}
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() =>
                                            setConfirm((p) => ({
                                                ...p,
                                                show: !p.show,
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {confirm.show ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {confirm.error ? (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <XCircle className="h-3.5 w-3.5" />
                                        {confirm.error}
                                    </p>
                                ) : confirm.value && !confirm.error ? (
                                    <p className="text-sm text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Password cocok
                                    </p>
                                ) : null}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        loading || !allFilled || hasErrors
                                    }
                                    className="bg-undip-blue hover:bg-undip-blue/90 text-white font-semibold px-8 rounded-xl h-11 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        "Simpan Password"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(backHref)}
                                    disabled={loading}
                                    className="rounded-xl h-11"
                                >
                                    Batal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Info Card ──────────────────────────────────────────── */}
                    <div className="space-y-4">
                        <Card className="border border-gray-200 shadow-sm rounded-3xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                    Ketentuan Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    {[
                                        "Minimal 8 karakter",
                                        "Gunakan kombinasi huruf besar & kecil",
                                        "Sertakan minimal 1 angka",
                                        "Simbol (!@#$%) membuat password lebih kuat",
                                        "Jangan gunakan password yang sama dengan sebelumnya",
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2"
                                        >
                                            <span className="mt-0.5 h-4 w-4 rounded-full bg-undip-blue/10 flex items-center justify-center shrink-0">
                                                <span className="h-1.5 w-1.5 rounded-full bg-undip-blue block" />
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border border-amber-100 bg-amber-50 shadow-sm rounded-3xl">
                            <CardContent className="pt-5">
                                <p className="text-sm text-amber-700 font-medium">
                                    ⚠️ Keamanan Akun
                                </p>
                                <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                                    Setelah mengubah password, Anda tetap dapat
                                    menggunakan sesi yang aktif. Jangan bagikan
                                    password kepada siapapun.
                                </p>
                                <p className="text-xs text-amber-600 mt-2 leading-relaxed">
                                    Maksimal <strong>5 percobaan</strong> per 15
                                    menit untuk keamanan akun Anda.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
