"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaRegBell } from "react-icons/fa";
import logoNavbar from "@/assets/images/logo-undip-navbar.png";

interface NavbarProps {
    userName?: string;
    showProfile?: boolean;
}

export function Navbar({
    userName = "Mahasiswa",
    showProfile = true,
}: NavbarProps) {
    return (
        <header className="relative z-50 flex h-16 w-full items-center justify-between bg-undip-blue px-4 shadow-md md:px-8 print:hidden">
            {/* Bagian Kiri: Logo & Nama Instansi */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-start">
                    <Image
                        src={logoNavbar}
                        alt="UNDIP Logo Small"
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                    />
                </div>
                <div className="flex flex-col leading-tight text-white">
                    <span className="text-xs font-medium opacity-90">
                        Fakultas
                    </span>
                    <span className="text-sm font-bold tracking-wide">
                        SAINS DAN MATEMATIKA
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                        UNIVERSITAS DIPONEGORO
                    </span>
                </div>
            </div>

            {/* Bagian Kanan: Notifikasi & Profil */}
            {showProfile && (
                <div className="flex items-center gap-4 text-white">
                    <button
                        aria-label="Notifikasi"
                        className="hover:opacity-80 transition"
                    >
                        <FaRegBell size={18} />
                    </button>

                    <div className="flex items-center gap-2 pl-4 border-l border-white/20">
                        <span className="text-sm font-medium hidden sm:block">
                            {userName}
                        </span>
                        <Avatar className="w-8 h-8 border-2 border-white/30 cursor-pointer">
                            <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt={userName}
                            />
                            <AvatarFallback>
                                {userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            )}
        </header>
    );
}
