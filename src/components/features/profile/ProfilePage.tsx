"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    User,
    Mail,
    Phone,
    Building,
    GraduationCap,
    Save,
    Loader2,
    Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileFormData {
    name: string;
    email: string;
    noHp: string;
    nim?: string;
    nip?: string;
    departemen?: string;
    programStudi?: string;
    jabatan?: string;
}

interface ProfilePageProps {
    backUrl?: string;
}

export function ProfilePage({ backUrl }: ProfilePageProps) {
    const { userData } = useAuth();
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        email: "",
        noHp: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                noHp: userData.mahasiswa?.noHp || userData.pegawai?.noHp || "",
                nim: userData.mahasiswa?.nim,
                nip: userData.pegawai?.nip,
                departemen:
                    userData.mahasiswa?.departemen?.name ||
                    userData.pegawai?.departemen?.name,
                programStudi: userData.mahasiswa?.programStudi?.name,
                jabatan: userData.pegawai?.jabatan,
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setSaveSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch("/api/me", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    noHp: formData.noHp,
                }),
            });

            if (response.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const isMahasiswa = !!userData?.mahasiswa;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src="" alt={formData.name} />
                    <AvatarFallback className="text-2xl bg-undip-blue text-white">
                        {formData.name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {formData.name || "Nama Pengguna"}
                    </h1>
                    <p className="text-slate-500">{formData.email}</p>
                    {formData.nim && (
                        <p className="text-sm text-undip-blue font-medium">
                            NIM: {formData.nim}
                        </p>
                    )}
                    {formData.nip && (
                        <p className="text-sm text-undip-blue font-medium">
                            NIP: {formData.nip}
                        </p>
                    )}
                </div>
            </div>

            {/* Profile Form */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-undip-blue" />
                        Informasi Profil
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Editable Fields */}
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-2"
                                >
                                    <User className="h-4 w-4 text-slate-400" />
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="h-11 bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="noHp"
                                    className="flex items-center gap-2"
                                >
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    Nomor HP
                                </Label>
                                <Input
                                    id="noHp"
                                    name="noHp"
                                    value={formData.noHp}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Read-only Info */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Informasi{" "}
                                {isMahasiswa ? "Akademik" : "Kepegawaian"}
                            </h4>

                            <div className="grid gap-3 text-sm">
                                {formData.departemen && (
                                    <div className="flex justify-between py-2 px-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">
                                            Departemen
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {formData.departemen}
                                        </span>
                                    </div>
                                )}
                                {formData.programStudi && (
                                    <div className="flex justify-between py-2 px-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">
                                            Program Studi
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {formData.programStudi}
                                        </span>
                                    </div>
                                )}
                                {formData.jabatan && (
                                    <div className="flex justify-between py-2 px-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">
                                            Jabatan
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {formData.jabatan}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full h-11 bg-undip-blue hover:bg-sky-700 gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isSaving
                                    ? "Menyimpan..."
                                    : saveSuccess
                                      ? "Tersimpan!"
                                      : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
