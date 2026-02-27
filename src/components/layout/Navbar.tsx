"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, User, KeyRound, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoNavbar from "@/assets/images/logo-undip-navbar.png";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

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
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const userName = propUserName || user?.name || "User";
    // If user.image is a raw MinIO object path (not an http URL), use the proxy endpoint
    const rawImage = propUserImage || user?.image || "";
    const userImage =
        rawImage && !rawImage.startsWith("http") ? "/api/me/photo" : rawImage;
    const showProfile = propShowProfile && !!user;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
    }, [pathname]);

    const getProfileLink = () => {
        if (pathname.startsWith("/super-admin")) return "/super-admin/profil";
        if (pathname.startsWith("/mahasiswa")) return "/mahasiswa/profile";
        if (pathname.startsWith("/supervisor-akademik"))
            return "/supervisor-akademik/profile";
        if (pathname.startsWith("/manajer-tu")) return "/manajer-tu/profile";
        if (pathname.startsWith("/wakil-dekan-1"))
            return "/wakil-dekan-1/profile";
        if (pathname.startsWith("/upa")) return "/upa/profile";
        return "/mahasiswa/profile";
    };

    const getChangePasswordLink = () => {
        if (pathname.startsWith("/super-admin"))
            return "/super-admin/profil/ubah-password";
        if (pathname.startsWith("/mahasiswa"))
            return "/mahasiswa/profile/ubah-password";
        if (pathname.startsWith("/supervisor-akademik"))
            return "/supervisor-akademik/profile/ubah-password";
        if (pathname.startsWith("/manajer-tu"))
            return "/manajer-tu/profile/ubah-password";
        if (pathname.startsWith("/wakil-dekan-1"))
            return "/wakil-dekan-1/profile/ubah-password";
        if (pathname.startsWith("/upa")) return "/upa/profile/ubah-password";
        return "/mahasiswa/profile/ubah-password";
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
        } catch {
            toast.error("Gagal keluar dari akun. Silakan coba lagi.");
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-undip-blue px-4 shadow-md md:px-8 print:hidden">
                {/* Bagian Kiri: Logo & Nama Instansi */}
                <div className="flex items-center gap-3">
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

                        {/* Profile Dropdown Trigger */}
                        <div
                            className="relative pl-4 border-l border-white/20"
                            ref={dropdownRef}
                        >
                            <button
                                onClick={() => setDropdownOpen((p) => !p)}
                                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                                aria-expanded={dropdownOpen}
                            >
                                <span className="text-sm font-medium hidden sm:block max-w-35 truncate">
                                    {userName}
                                </span>
                                <Avatar className="w-8 h-8 border-2 border-white/30">
                                    {userImage ? (
                                        <AvatarImage
                                            src={userImage}
                                            alt={userName}
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">
                                        {userName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <ChevronDown
                                    className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown Panel */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* User info header */}
                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {userName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1.5">
                                        <Link
                                            href={getProfileLink()}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-undip-blue transition-colors"
                                        >
                                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-undip-blue">
                                                <User className="h-3.5 w-3.5" />
                                            </span>
                                            Profil Saya
                                        </Link>
                                        <Link
                                            href={getChangePasswordLink()}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-undip-blue transition-colors"
                                        >
                                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 text-violet-600">
                                                <KeyRound className="h-3.5 w-3.5" />
                                            </span>
                                            Ubah Password
                                        </Link>
                                    </div>

                                    <div className="border-t border-slate-100 py-1.5">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                setShowLogoutModal(true);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-500">
                                                <LogOut className="h-3.5 w-3.5" />
                                            </span>
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() =>
                            !isLoggingOut && setShowLogoutModal(false)
                        }
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Keluar dari Akun?
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Anda akan keluar dari sesi ini. Pastikan
                                    pekerjaan Anda sudah tersimpan.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={() => setShowLogoutModal(false)}
                                    disabled={isLoggingOut}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleLogoutConfirm}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Keluar...
                                        </span>
                                    ) : (
                                        "Ya, Keluar"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
