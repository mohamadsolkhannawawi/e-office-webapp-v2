"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { NotificationBell } from "@/components/layout/NotificationBell";
import logoNavbar from "@/assets/images/logo-undip-navbar.png";

const NotificationBell = dynamic(
    () =>
        import("@/components/layout/NotificationBell").then(
            (mod) => mod.NotificationBell,
        ),
    { ssr: false },
);

interface NavbarProps {
    userName?: string;
    userImage?: string;
    showProfile?: boolean;
    onMenuClick?: () => void;
}

export function Navbar({
    userName: propUserName,
    userImage: propUserImage,
    showProfile: propShowProfile = true,
    onMenuClick,
}: NavbarProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    const userName = propUserName || user?.name || "User";
    const userImage = propUserImage || user?.image || "";
    const showProfile = propShowProfile && !!user;

    const getProfileLink = () => {
        if (pathname.startsWith("/mahasiswa")) return "/mahasiswa/profile";
        if (pathname.startsWith("/supervisor-akademik"))
            return "/supervisor-akademik/profile";
        if (pathname.startsWith("/manajer-tu")) return "/manajer-tu/profile";
        if (pathname.startsWith("/wakil-dekan-1"))
            return "/wakil-dekan-1/profile";
        if (pathname.startsWith("/upa")) return "/upa/profile";
        return "/mahasiswa/profile";
    };

    const profileLink = getProfileLink();

    return (
        <header className="relative z-50 flex h-16 w-full items-center justify-between bg-undip-blue px-4 shadow-md md:px-8 print:hidden">
            {/* Bagian Kiri: Logo & Nama Instansi */}
            <div className="flex items-center gap-3">
                {/* Hamburger Button - Only visible on mobile/tablet */}
                {onMenuClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="lg:hidden text-white hover:bg-white/10 -ml-2"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                )}
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-start">
                    <Image
                        src={logoNavbar}
                        alt="UNDIP Logo Small"
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                    />
                </div>
                <div className="flex flex-col leading-tight text-white">
                    <span className="text-[9px] sm:text-xs font-medium opacity-90">
                        Fakultas
                    </span>
                    <span className="text-[11px] sm:text-sm font-bold tracking-wide">
                        SAINS DAN MATEMATIKA
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-medium opacity-80">
                        UNIVERSITAS DIPONEGORO
                    </span>
                </div>
            </div>

            {/* Bagian Kanan: Notifikasi & Profil */}
            {showProfile && (
                <div className="flex items-center gap-4 text-white">
                    <NotificationBell />

                    <div className="flex items-center gap-2 pl-4 border-l border-white/20">
                        <span className="text-sm font-medium hidden sm:block">
                            {userName}
                        </span>
                        <Link href={profileLink}>
                            <Avatar className="w-8 h-8 border-2 border-white/30 cursor-pointer hover:border-white/60 transition-colors">
                                {userImage ? (
                                    <AvatarImage
                                        src={userImage}
                                        alt={userName}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-white/10 text-white">
                                    {userName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
