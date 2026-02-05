"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    Building,
    Loader2,
    Briefcase,
    GraduationCap,
    Edit,
    MapPin,
    Calendar,
    Hash,
} from "lucide-react";
import { getMe, UserProfile } from "@/lib/application-api";
import toast from "react-hot-toast";

// Format tanggal ke format Indonesia
const formatDateToIndonesian = (dateString?: string): string => {
    if (!dateString) return "-";

    const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

// Map role names from backend to display labels
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

interface ProfileTableRowProps {
    label: string;
    value?: string | number;
    icon?: React.ReactNode;
}

const ProfileTableRow = ({ label, value, icon }: ProfileTableRowProps) => {
    return (
        <div className="flex border-b border-gray-200 hover:bg-gray-50">
            <div className="flex items-center gap-3 bg-gray-50 px-6 py-4 font-medium text-gray-700 w-1/3 border-r border-gray-200">
                {icon && <span className="text-gray-500">{icon}</span>}
                <span>{label}</span>
            </div>
            <div className="flex items-center px-6 py-4 text-gray-900 w-2/3">
                {value || "-"}
            </div>
        </div>
    );
};

const ProfilePage = ({ editHref }: { editHref: string }) => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await getMe();
                const parsed = parseUserData(response);
                setProfileData(parsed);
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
                <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
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
            {/* Header dengan Avatar dan Edit Button */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage
                            src={profileData.image}
                            alt={profileData.name}
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
                            {getInitials(profileData.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {profileData.name}
                        </h1>
                        {profileData.userRole && (
                            <p className="text-lg text-gray-600">
                                {profileData.userRole}
                            </p>
                        )}
                        <p className="text-gray-500">{profileData.email}</p>
                    </div>
                </div>
                <Link href={editHref}>
                    <Button
                        className="gap-2 h-10 px-4 text-sm font-semibold text-white"
                        style={{ backgroundColor: "#0078bd" }}
                    >
                        <Edit className="h-4 w-4" />
                        Edit Profil
                    </Button>
                </Link>
            </div>

            {/* Tabel Profil Formal - 2 Kolom */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-200 bg-gray-50 px-0 py-0">
                    <CardTitle className="px-6 py-4 text-lg font-semibold text-gray-900">
                        Informasi Pribadi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                        <ProfileTableRow
                            label="Nama Lengkap"
                            value={profileData.name}
                            icon={<User className="h-5 w-5" />}
                        />
                        <ProfileTableRow
                            label="Email"
                            value={profileData.email}
                            icon={<Mail className="h-5 w-5" />}
                        />
                        {profileData.noHp && (
                            <ProfileTableRow
                                label="Nomor Telepon"
                                value={profileData.noHp}
                                icon={<Phone className="h-5 w-5" />}
                            />
                        )}
                        {profileData.identifierLabel &&
                            profileData.identifier && (
                                <ProfileTableRow
                                    label={profileData.identifierLabel}
                                    value={profileData.identifier}
                                    icon={<Hash className="h-5 w-5" />}
                                />
                            )}
                        {profileData.departemen && (
                            <ProfileTableRow
                                label="Departemen"
                                value={profileData.departemen}
                                icon={<Building className="h-5 w-5" />}
                            />
                        )}
                        {profileData.programStudi && (
                            <ProfileTableRow
                                label={
                                    profileData.isMahasiswa
                                        ? "Program Studi"
                                        : "Program Studi"
                                }
                                value={profileData.programStudi}
                                icon={<GraduationCap className="h-5 w-5" />}
                            />
                        )}
                        {profileData.jabatan && (
                            <ProfileTableRow
                                label="Jabatan"
                                value={profileData.jabatan}
                                icon={<Briefcase className="h-5 w-5" />}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Data Tambahan untuk Mahasiswa */}
            {profileData.isMahasiswa && (
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-200 bg-gray-50 px-0 py-0">
                        <CardTitle className="px-6 py-4 text-lg font-semibold text-gray-900">
                            Data Pendidikan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-200">
                            {profileData.tahunMasuk && (
                                <ProfileTableRow
                                    label="Tahun Masuk"
                                    value={profileData.tahunMasuk?.toString()}
                                />
                            )}
                            {profileData.tempatLahir && (
                                <ProfileTableRow
                                    label="Tempat Lahir"
                                    value={profileData.tempatLahir}
                                    icon={<MapPin className="h-5 w-5" />}
                                />
                            )}
                            {profileData.tanggalLahir && (
                                <ProfileTableRow
                                    label="Tanggal Lahir"
                                    value={formatDateToIndonesian(
                                        profileData.tanggalLahir,
                                    )}
                                    icon={<Calendar className="h-5 w-5" />}
                                />
                            )}
                            {profileData.alamat && (
                                <ProfileTableRow
                                    label="Alamat"
                                    value={profileData.alamat}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data Tambahan untuk Pegawai */}
            {!profileData.isMahasiswa && profileData.alamat && (
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-200 bg-gray-50 px-0 py-0">
                        <CardTitle className="px-6 py-4 text-lg font-semibold text-gray-900">
                            Data Tambahan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-200">
                            <ProfileTableRow
                                label="Alamat"
                                value={profileData.alamat}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;
