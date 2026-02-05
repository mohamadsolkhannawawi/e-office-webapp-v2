"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User, Phone, Loader2, ChevronLeft, Save } from "lucide-react";
import { getMe, updateProfile, UserProfile } from "@/lib/application-api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const getRoleDisplayName = (roleName?: string): string | undefined => {
    if (!roleName) return undefined;

    const roleMap: Record<string, string> = {
        MAHASISWA: "Mahasiswa",
        SUPERVISOR_AKADEMIK: "Supervisor Akademik",
        MANAJER_TU: "Manajer TU",
        WAKIL_DEKAN_1: "Wakil Dekan 1",
        UPA: "UPA",
        mahasiswa: "Mahasiswa",
        "supervisor-akademik": "Supervisor Akademik",
        "manajer-tu": "Manajer TU",
        "wakil-dekan-1": "Wakil Dekan 1",
        upa: "UPA",
    };

    return roleMap[roleName] || roleName;
};

interface ProfileData {
    name: string;
    email: string;
    image?: string;
    userRole?: string;
    noHp?: string;
    identifier?: string;
    identifierLabel?: string;
    tahunMasuk?: number;
    alamat?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    departemen?: string;
    programStudi?: string;
    jabatan?: string;
    isMahasiswa?: boolean;
}

interface EditFormData {
    name: string;
    noHp: string;
}

const parseUserData = (user: UserProfile | null): ProfileData | null => {
    if (!user) return null;

    const isMahasiswa = !!user.mahasiswa;

    const alamat = isMahasiswa ? user.mahasiswa?.alamat : undefined;

    const tempatLahir = isMahasiswa ? user.mahasiswa?.tempatLahir : undefined;

    const tanggalLahir = isMahasiswa ? user.mahasiswa?.tanggalLahir : undefined;

    const tahunMasuk =
        isMahasiswa && user.mahasiswa?.tahunMasuk
            ? parseInt(user.mahasiswa.tahunMasuk)
            : undefined;

    const jabatan = !isMahasiswa ? user.pegawai?.jabatan : undefined;

    const identifier = isMahasiswa ? user.mahasiswa?.nim : user.pegawai?.nip;

    const identifierLabel = isMahasiswa ? "NIM" : "NIP";

    const departemen = isMahasiswa
        ? user.mahasiswa?.programStudi?.name
        : user.pegawai?.departemen?.name;

    const programStudi = isMahasiswa
        ? user.mahasiswa?.programStudi?.name
        : user.pegawai?.programStudi?.name;

    const noHp = isMahasiswa ? user.mahasiswa?.noHp : user.pegawai?.noHp;

    return {
        name: user.name,
        email: user.email || "",
        image: user.image,
        userRole: getRoleDisplayName(user.userRole?.[0]?.role?.name),
        noHp,
        identifier,
        identifierLabel,
        tahunMasuk,
        alamat,
        tempatLahir,
        tanggalLahir,
        departemen,
        programStudi,
        jabatan,
        isMahasiswa,
    };
};

const ProfileEditPage = ({ backHref }: { backHref: string }) => {
    const router = useRouter();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [formData, setFormData] = useState<EditFormData>({
        name: "",
        noHp: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await getMe();
                const parsed = parseUserData(response);
                setProfileData(parsed);
                if (parsed) {
                    setFormData({
                        name: parsed.name,
                        noHp: parsed.noHp || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error(
                    "Gagal memuat data profil. Silakan refresh halaman atau hubungi administrator",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
                toast.success(
                    "Profil berhasil diperbarui! Data Anda telah tersimpan",
                );
                router.push(backHref);
            } else {
                toast.error(
                    "Gagal memperbarui profil. Periksa koneksi internet Anda",
                );
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(
                "Terjadi kesalahan sistem. Silakan coba lagi atau hubungi administrator",
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Edit Profil
                </h1>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    Gagal memuat data profil. Silakan coba lagi nanti.
                </div>
            </div>
        );
    }

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={backHref}>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Profil
                    </h1>
                    <p className="text-gray-600">
                        Perbarui informasi profil Anda
                    </p>
                </div>
            </div>

            {/* Profile Info Card */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-200 bg-gray-50 px-0 py-0">
                    <CardTitle className="px-6 py-4 text-lg font-semibold text-gray-900">
                        Informasi Pribadi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Avatar and Basic Info */}
                        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={profileData.image}
                                    alt={profileData.name}
                                />
                                <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
                                    {getInitials(profileData.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {profileData.userRole}
                                </p>
                                <p className="text-gray-500">
                                    {profileData.email}
                                </p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">
                                    Nama Lengkap
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="pl-10 h-10"
                                        placeholder="Nama lengkap"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="noHp" className="font-semibold">
                                    Nomor Telepon
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="noHp"
                                        name="noHp"
                                        value={formData.noHp}
                                        onChange={handleInputChange}
                                        className="pl-10 h-10"
                                        placeholder="Contoh: 081234567890"
                                        type="tel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Read-only Fields */}
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                                Informasi Institusi (Tidak dapat diubah)
                            </h3>

                            {profileData.identifier && (
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium text-gray-500">
                                        {profileData.identifierLabel}
                                    </Label>
                                    <p className="text-gray-900 font-medium">
                                        {profileData.identifier}
                                    </p>
                                </div>
                            )}

                            {profileData.departemen && (
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium text-gray-500">
                                        Departemen
                                    </Label>
                                    <p className="text-gray-900 font-medium">
                                        {profileData.departemen}
                                    </p>
                                </div>
                            )}

                            {profileData.programStudi && (
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium text-gray-500">
                                        Program Studi
                                    </Label>
                                    <p className="text-gray-900 font-medium">
                                        {profileData.programStudi}
                                    </p>
                                </div>
                            )}

                            {profileData.jabatan && (
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium text-gray-500">
                                        Jabatan
                                    </Label>
                                    <p className="text-gray-900 font-medium">
                                        {profileData.jabatan}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                            <Link href={backHref}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 px-6 text-sm font-semibold"
                                >
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="h-10 px-6 text-sm font-semibold gap-2 text-white"
                                style={{ backgroundColor: "#0078bd" }}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isSaving ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Info Alert */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                    <span className="font-semibold">Catatan:</span> Informasi
                    institusi seperti departemen, program studi, dan jabatan
                    tidak dapat diubah di sini. Jika ada ketidaksesuaian,
                    silakan hubungi operator untuk sinkronisasi ulang.
                </p>
            </div>
        </div>
    );
};

export default ProfileEditPage;
