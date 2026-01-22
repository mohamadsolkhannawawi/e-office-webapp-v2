"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    Save,
    Loader2,
    Calendar,
    MapPin,
    Hash,
    Briefcase,
    GraduationCap,
} from "lucide-react";
import { getMe, updateProfile, UserProfile } from "@/lib/application-api";
import toast from "react-hot-toast";

interface ProfileFormData {
    name: string;
    email: string;
    noHp: string;
    // Scalar fields
    nim?: string;
    nip?: string;
    tahunMasuk?: string;
    alamat?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    semester?: number;
    ipk?: number;
    ips?: number;
    // Relations
    departemen?: string;
    programStudi?: string;
    jabatan?: string;
}

interface ProfilePageProps {
    backUrl?: string;
}

export function ProfilePage({ backUrl }: ProfilePageProps) {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        email: "",
        noHp: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMe();
            if (data) {
                setUserData(data);
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    noHp: data.mahasiswa?.noHp || data.pegawai?.noHp || "",
                    nim: data.mahasiswa?.nim,
                    nip: data.pegawai?.nip,
                    tahunMasuk: data.mahasiswa?.tahunMasuk,
                    alamat: data.mahasiswa?.alamat || undefined,
                    tempatLahir: data.mahasiswa?.tempatLahir || undefined,
                    tanggalLahir: data.mahasiswa?.tanggalLahir
                        ? new Date(
                              data.mahasiswa.tanggalLahir,
                          ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                          })
                        : undefined,
                    semester: data.mahasiswa?.semester || undefined,
                    ipk: data.mahasiswa?.ipk || undefined,
                    ips: data.mahasiswa?.ips || undefined,
                    departemen:
                        data.mahasiswa?.departemen?.name ||
                        data.pegawai?.departemen?.name,
                    programStudi:
                        data.mahasiswa?.programStudi?.name ||
                        data.pegawai?.programStudi?.name,
                    jabatan: data.pegawai?.jabatan,
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
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const success = await updateProfile({
                name: formData.name,
                noHp: formData.noHp,
            });

            if (success) {
                toast.success("Profil berhasil diperbarui");
                // Refresh data
                const updatedData = await getMe();
                if (updatedData) setUserData(updatedData);
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-undip-blue" />
                <p className="text-sm text-slate-500 font-medium">
                    Memuat profil institusi...
                </p>
            </div>
        );
    }

    const isMahasiswa = !!userData?.mahasiswa;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <Avatar className="w-28 h-28 border-4 border-blue-50 shadow-xl ring-1 ring-slate-100">
                    <AvatarImage
                        src={userData?.image || ""}
                        alt={formData.name}
                    />
                    <AvatarFallback className="text-4xl bg-linear-to-br from-undip-blue to-sky-600 text-white font-black">
                        {formData.name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {formData.name || "Nama Pengguna"}
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-1 bg-undip-blue/10 text-undip-blue text-[10px] font-black uppercase tracking-widest rounded-md border border-undip-blue/20 w-fit mx-auto md:mx-0">
                            {userData?.userRole?.[0]?.role?.name || "User"}
                        </span>
                    </div>
                    <p className="text-slate-500 font-bold mb-4">
                        {formData.email}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {formData.nim && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-undip-blue">
                                    <Hash size={14} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-bold text-slate-400 leading-none">
                                        NIM
                                    </span>
                                    <span className="text-sm font-black text-slate-700">
                                        {formData.nim}
                                    </span>
                                </div>
                            </div>
                        )}
                        {formData.nip && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-undip-blue">
                                    <Hash size={14} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-bold text-slate-400 leading-none">
                                        NIP
                                    </span>
                                    <span className="text-sm font-black text-slate-700">
                                        {formData.nip}
                                    </span>
                                </div>
                            </div>
                        )}
                        {formData.tahunMasuk && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                <div className="p-1.5 bg-slate-200 rounded-lg text-slate-600">
                                    <Calendar size={14} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-bold text-slate-400 leading-none">
                                        Tahun Masuk
                                    </span>
                                    <span className="text-sm font-black text-slate-700">
                                        {formData.tahunMasuk}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Column (Left/Top) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <Card className="shadow-lg border-slate-200 overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base flex items-center gap-2 text-slate-800 font-black uppercase tracking-tight">
                                <User className="h-5 w-5 text-undip-blue" />
                                Personalisasi Profil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1"
                                        >
                                            Nama Lengkap Institusi
                                        </Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-undip-blue transition-colors">
                                                <User size={18} />
                                            </div>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="h-12 pl-10 border-slate-200 focus:ring-undip-blue rounded-xl font-bold"
                                                placeholder="Nama Lengkap"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="noHp"
                                            className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1"
                                        >
                                            Nomor Handphone Terdaftar
                                        </Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-undip-blue transition-colors">
                                                <Phone size={18} />
                                            </div>
                                            <Input
                                                id="noHp"
                                                name="noHp"
                                                value={formData.noHp}
                                                onChange={handleChange}
                                                className="h-12 pl-10 border-slate-200 focus:ring-undip-blue rounded-xl font-bold"
                                                placeholder="Contoh: 081234567890"
                                                type="tel"
                                                required
                                            />
                                        </div>
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
                                        ? "Sinkronisasi Data..."
                                        : "Perbarui Data"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Address & Personal Card (Only if Mahasiswa has it) */}
                    {isMahasiswa && formData.alamat && (
                        <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                                <CardTitle className="text-base flex items-center gap-2 text-slate-800 font-black uppercase tracking-tight">
                                    <MapPin className="h-5 w-5 text-undip-blue" />
                                    Domisili & Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Alamat Lengkap
                                    </Label>
                                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                                        "{formData.alamat}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Tempat Lahir
                                        </Label>
                                        <p className="font-bold text-slate-800">
                                            {formData.tempatLahir || "-"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Tanggal Lahir
                                        </Label>
                                        <p className="font-bold text-slate-800">
                                            {formData.tanggalLahir || "-"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Institution Info Column (Right) */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden h-fit">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-base flex items-center gap-2 text-slate-800 font-black uppercase tracking-tight">
                                <Building className="h-5 w-5 text-undip-blue" />
                                Institusi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="flex flex-col gap-5">
                                {formData.departemen && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Briefcase
                                                size={12}
                                                className="text-undip-blue"
                                            />
                                            Departemen
                                        </div>
                                        <p className="text-sm font-black text-slate-800 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                                            {formData.departemen}
                                        </p>
                                    </div>
                                )}
                                {formData.programStudi && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <GraduationCap
                                                size={12}
                                                className="text-undip-blue"
                                            />
                                            Program Studi
                                        </div>
                                        <p className="text-sm font-black text-slate-800 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100/50">
                                            {formData.programStudi}
                                        </p>
                                    </div>
                                )}
                                {formData.jabatan && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <div className="w-1 h-1 bg-undip-blue rounded-full" />
                                            Jabatan Struktural
                                        </div>
                                        <p className="text-sm font-black text-undip-blue py-1 pl-3 border-l-2 border-undip-blue/30 italic">
                                            {formData.jabatan}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Academic Metrics for Mahasiswa */}
                            {isMahasiswa && (
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Semester
                                            </span>
                                            <span className="text-xl font-black text-slate-900">
                                                {formData.semester || "-"}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    IPK
                                                </span>
                                                <span className="text-xl font-black text-emerald-600">
                                                    {formData.ipk?.toFixed(2) ||
                                                        "-"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    IPS
                                                </span>
                                                <span className="text-xl font-black text-blue-600">
                                                    {formData.ips?.toFixed(2) ||
                                                        "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-xl text-undip-blue">
                            <Mail size={18} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-undip-blue uppercase tracking-widest">
                                Bantuan & Dukungan
                            </p>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                Jika terdapat ketidaksesuaian data institusi
                                (NIM/NIP, Fakultas, PS), harap hubungi operator
                                SI-Akad/Kepegawaian untuk sinkronisasi ulang.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
