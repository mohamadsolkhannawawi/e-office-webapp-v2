"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Lock,
} from "lucide-react";
import { getMe, UserProfile } from "@/lib/application-api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

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
    SUPER_ADMIN: "Super Admin",
    MAHASISWA: "Mahasiswa",
    SUPERVISOR: "Supervisor Akademik",
    SUPERVISOR_AKADEMIK: "Supervisor Akademik",
    MANAJER_TU: "Manajer TU",
    WAKIL_DEKAN_1: "Wakil Dekan 1",
    UPA: "UPA",
    "super-admin": "Super Admin",
    mahasiswa: "Mahasiswa",
    supervisor: "Supervisor Akademik",
    "supervisor-akademik": "Supervisor Akademik",
    "manajer-tu": "Manajer TU",
    "wakil-dekan-1": "Wakil Dekan 1",
    upa: "UPA",
  };

  if (roleMap[roleName]) {
    return roleMap[roleName];
  }

  // Fallback: convert snake_case to Title Case
  return roleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
    <div className="flex flex-col sm:flex-row border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 font-medium text-gray-700 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200">
        {icon && <span className="text-gray-500 shrink-0">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="flex items-center px-4 py-3 sm:px-6 sm:py-4 text-gray-900 sm:w-2/3 min-w-0">
        <span className="break-words min-w-0">{value || "-"}</span>
      </div>
    </div>
  );
};

const ProfilePage = ({
  editHref,
  changePasswordHref,
}: {
  editHref: string;
  changePasswordHref?: string;
}) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header dengan Avatar dan Edit Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="group relative cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full shrink-0"
            title="Klik untuk melihat foto profil"
          >
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.image} alt={profileData.name} />
              <AvatarFallback className="bg-blue-600 text-white text-lg font-semibold">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>
            {profileData.image && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                  Lihat
                </div>
              </div>
            )}
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 break-words">
              {profileData.name}
            </h1>
            {profileData.userRole && (
              <p className="text-sm sm:text-lg text-gray-600">
                {profileData.userRole}
              </p>
            )}
            <p className="text-sm text-gray-500 break-all">
              {profileData.email}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link href={editHref}>
            <Button
              className="gap-2 h-10 px-4 text-sm font-semibold text-white w-full sm:w-auto"
              style={{ backgroundColor: "#0078bd" }}
            >
              <Edit className="h-4 w-4" />
              Edit Profil
            </Button>
          </Link>
          {changePasswordHref && (
            <Link href={changePasswordHref}>
              <Button
                variant="outline"
                className="gap-2 h-10 px-4 text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
              >
                <Lock className="h-4 w-4" />
                Ubah Password
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Photo Modal Dialog */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogPortal>
          <DialogOverlay className="bg-black/50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {profileData.image ? (
              <div className="relative max-h-[80vh] max-w-[90vw] md:max-w-2xl lg:max-w-3xl overflow-hidden rounded-lg">
                <Image
                  src={profileData.image}
                  alt={profileData.name}
                  width={800}
                  height={800}
                  className="w-full h-auto object-contain"
                  priority
                  unoptimized
                />
                <DialogClose className="absolute top-4 right-4 rounded-full bg-white hover:bg-gray-200 transition-colors p-2 text-black z-50 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6l-12 12M6 6l12 12" />
                  </svg>
                </DialogClose>
              </div>
            ) : (
              <div className="relative flex items-center justify-center max-h-[80vh] max-w-[90vw] md:max-w-96 bg-white rounded-lg">
                <Avatar className="h-48 w-48">
                  <AvatarFallback className="bg-blue-600 text-white text-6xl font-semibold">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <DialogClose className="absolute top-4 right-4 rounded-full bg-white hover:bg-gray-200 transition-colors p-2 text-black z-50 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6l-12 12M6 6l12 12" />
                  </svg>
                </DialogClose>
              </div>
            )}
          </div>
        </DialogPortal>
      </Dialog>

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
            {profileData.userRole && (
              <ProfileTableRow
                label="Peran"
                value={profileData.userRole}
                icon={<Briefcase className="h-5 w-5" />}
              />
            )}
            {profileData.noHp && (
              <ProfileTableRow
                label="Nomor Telepon"
                value={profileData.noHp}
                icon={<Phone className="h-5 w-5" />}
              />
            )}
            {profileData.identifierLabel && profileData.identifier && (
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
                  profileData.isMahasiswa ? "Program Studi" : "Program Studi"
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
                  value={formatDateToIndonesian(profileData.tanggalLahir)}
                  icon={<Calendar className="h-5 w-5" />}
                />
              )}
              {profileData.alamat && (
                <ProfileTableRow label="Alamat" value={profileData.alamat} />
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
              <ProfileTableRow label="Alamat" value={profileData.alamat} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
