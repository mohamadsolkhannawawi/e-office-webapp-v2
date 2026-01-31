"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    Building,
    Save,
    Loader2,
    Calendar,
    MapPin,
    Hash,
    Briefcase,
    GraduationCap,
    ChevronLeft,
} from "lucide-react";
import { getMe, updateProfile, UserProfile } from "@/lib/application-api";
import toast from "react-hot-toast";

// Map role names from backend to display labels
const getRoleDisplayName = (roleName?: string): string | undefined => {
    if (!roleName) return undefined;

    const roleMap: Record<string, string> = {
        MAHASISWA: "Mahasiswa",
        SUPERVISOR_AKADEMIK: "Supervisor Akademik",
        MANAJER_TU: "Manajer TU",
        WAKIL_DEKAN_1: "Wakil Dekan 1",
        UPA: "UPA",
        // Fallback untuk format lain
        mahasiswa: "Mahasiswa",
        "supervisor-akademik": "Supervisor Akademik",
        "manajer-tu": "Manajer TU",
        "wakil-dekan-1": "Wakil Dekan 1",
        upa: "UPA",
    };

    return roleMap[roleName] || roleName;
};

type UserType = "mahasiswa" | "pegawai";

interface ProfileData {
    // Common fields
    name: string;
    email: string;
    image?: string;
    userRole?: string;

    // Contact
    noHp?: string;

    // Identifiers
    identifier?: string; // NIM or NIP
    identifierLabel?: string; // "NIM" or "NIP"

    // Personal (mahasiswa only)
    tahunMasuk?: string;
    alamat?: string;
    tempatLahir?: string;
    tanggalLahir?: string;

    // Structural (pegawai only)
    jabatan?: string;

    // Both
    departemen?: string;
    programStudi?: string;
}

interface ProfilePageProps {
    backUrl?: string;
}

export function ProfilePage({ backUrl }: ProfilePageProps) {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [profileData, setProfileData] = useState<ProfileData>({
        name: "",
        email: "",
    });
    const [editableData, setEditableData] = useState({
        name: "",
        noHp: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Parse user data based on user type
    const parseUserData = (
        data: UserProfile,
    ): [ProfileData, UserType | null] => {
        const isMahasiswa = !!data.mahasiswa;
        const userType: UserType | null = isMahasiswa
            ? "mahasiswa"
            : data.pegawai
              ? "pegawai"
              : null;

        const parsed: ProfileData = {
            name: data.name || "",
            email: data.email || "",
            image: data.image,
            userRole: getRoleDisplayName(data.userRole?.[0]?.role?.name),
            noHp: isMahasiswa ? data.mahasiswa?.noHp : data.pegawai?.noHp,
        };

        if (isMahasiswa && data.mahasiswa) {
            parsed.identifier = data.mahasiswa.nim;
            parsed.identifierLabel = "NIM";
            parsed.tahunMasuk = data.mahasiswa.tahunMasuk;
            parsed.alamat = data.mahasiswa.alamat;
            parsed.tempatLahir = data.mahasiswa.tempatLahir;
            parsed.tanggalLahir = data.mahasiswa.tanggalLahir
                ? new Date(data.mahasiswa.tanggalLahir).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" },
                  )
                : undefined;
            parsed.departemen = data.mahasiswa.departemen?.name;
            parsed.programStudi = data.mahasiswa.programStudi?.name;
        } else if (data.pegawai) {
            parsed.identifier = data.pegawai.nip;
            parsed.identifierLabel = "NIP";
            parsed.jabatan = data.pegawai.jabatan;
            parsed.departemen = data.pegawai.departemen?.name;
            parsed.programStudi = data.pegawai.programStudi?.name;
        }

        return [parsed, userType];
    };

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMe();
            if (data) {
                setUserData(data);
                const [parsed] = parseUserData(data);
                setProfileData(parsed);
                setEditableData({
                    name: parsed.name,
                    noHp: parsed.noHp || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("Gagal memuat profil");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const success = await updateProfile({
                name: editableData.name,
                noHp: editableData.noHp,
            });

            if (success) {
                toast.success("Profil berhasil diperbarui");
                const updatedData = await getMe();
                if (updatedData) {
                    setUserData(updatedData);
                    const [parsed] = parseUserData(updatedData);
                    setProfileData(parsed);
                }
            } else {
                toast.error("Gagal memperbarui profil");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-undip-blue" />
                <p className="text-sm text-slate-500 font-medium">
                    Memuat profil...
                </p>
            </div>
        );
    }

    const [, userType] = userData ? parseUserData(userData) : [null, null];
    const isMahasiswa = userType === "mahasiswa";

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Profil Saya
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Kelola informasi profil pribadi dan institusi Anda
                </p>
            </div>

            {/* Profile Header Card */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-linear-to-r from-slate-50 to-slate-50 border-b border-slate-100 py-8 px-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <Avatar className="w-28 h-28 border-4 border-white shadow-lg ring-1 ring-slate-100">
                            <AvatarImage
                                src={profileData.image || ""}
                                alt={profileData.name}
                            />
                            <AvatarFallback className="text-4xl bg-linear-to-br from-undip-blue to-sky-600 text-white font-black">
                                {profileData.name
                                    ?.substring(0, 2)
                                    .toUpperCase() || "??"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-slate-900">
                                    {profileData.name}
                                </h1>
                                {profileData.userRole && (
                                    <span className="inline-flex items-center px-3 py-1 bg-undip-blue/10 text-undip-blue text-xs font-black uppercase tracking-widest rounded-lg border border-undip-blue/20">
                                        {profileData.userRole}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 font-semibold text-sm">
                                {profileData.email}
                            </p>

                            {/* Quick Info Pills */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                                {profileData.identifier && (
                                    <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-xs font-bold text-slate-400">
                                            {profileData.identifierLabel}
                                        </p>
                                        <p className="text-sm font-black text-slate-700">
                                            {profileData.identifier}
                                        </p>
                                    </div>
                                )}
                                {profileData.tahunMasuk && (
                                    <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="text-xs font-bold text-slate-400">
                                            Tahun Masuk
                                        </p>
                                        <p className="text-sm font-black text-slate-700">
                                            {profileData.tahunMasuk}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Profile Card */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base flex items-center gap-2 text-slate-800 font-black uppercase tracking-tight">
                                <User className="h-5 w-5 text-undip-blue" />
                                Informasi Pribadi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Nama Lengkap
                                    </Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-undip-blue transition-colors">
                                            <User size={18} />
                                        </div>
                                        <Input
                                            name="name"
                                            value={editableData.name}
                                            onChange={handleChange}
                                            className="h-12 pl-10 border-slate-200 focus:ring-undip-blue rounded-xl font-bold"
                                            placeholder="Nama Lengkap"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Nomor Handphone
                                    </Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-undip-blue transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <Input
                                            name="noHp"
                                            value={editableData.noHp}
                                            onChange={handleChange}
                                            className="h-12 pl-10 border-slate-200 focus:ring-undip-blue rounded-xl font-bold"
                                            placeholder="Contoh: 081234567890"
                                            type="tel"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full h-12 bg-undip-blue hover:bg-sky-800 text-white font-black rounded-xl shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98] gap-3"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5" />
                                    )}
                                    {isSaving
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Personal Data Card (Mahasiswa Only) */}
                    {isMahasiswa &&
                        (profileData.alamat ||
                            profileData.tempatLahir ||
                            profileData.tanggalLahir) && (
                            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                                    <CardTitle className="text-base flex items-center gap-2 text-slate-800 font-black uppercase tracking-tight">
                                        <MapPin className="h-5 w-5 text-undip-blue" />
                                        Informasi Pribadi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {profileData.alamat && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                Alamat Lengkap
                                            </p>
                                            <p className="text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                                                {profileData.alamat}
                                            </p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        {profileData.tempatLahir && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                    Tempat Lahir
                                                </p>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {profileData.tempatLahir}
                                                </p>
                                            </div>
                                        )}
                                        {profileData.tanggalLahir && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                    Tanggal Lahir
                                                </p>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {profileData.tanggalLahir}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                </div>

                {/* Sidebar: Institution Info */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden h-fit">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base flex items-center gap-2 text-slate-800 font-black uppercase tracking-tight">
                                <Building className="h-5 w-5 text-undip-blue" />
                                Institusi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {profileData.departemen && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <Briefcase
                                            size={14}
                                            className="text-undip-blue"
                                        />
                                        Departemen
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                        {profileData.departemen}
                                    </p>
                                </div>
                            )}
                            {profileData.programStudi && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <GraduationCap
                                            size={14}
                                            className="text-undip-blue"
                                        />
                                        Program Studi
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 bg-sky-50/50 p-3 rounded-lg border border-sky-100/50">
                                        {profileData.programStudi}
                                    </p>
                                </div>
                            )}
                            {profileData.jabatan && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <Briefcase
                                            size={14}
                                            className="text-undip-blue"
                                        />
                                        Jabatan Struktural
                                    </div>
                                    <p className="text-sm font-bold text-undip-blue py-1 pl-3 border-l-2 border-undip-blue/30 italic">
                                        {profileData.jabatan}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Help Section */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-undip-blue shrink-0">
                            <Mail size={18} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-undip-blue uppercase tracking-widest">
                                Informasi
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Jika ada ketidaksesuaian data institusi, silakan
                                hubungi operator untuk sinkronisasi ulang.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
