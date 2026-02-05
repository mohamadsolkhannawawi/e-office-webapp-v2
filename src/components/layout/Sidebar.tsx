"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Mail,
    FileEdit,
    LogOut,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Archive,
    Settings,
    User,
    PenTool,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: (collapsed: boolean) => void;
}

interface MenuItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    submenu?: { label: string; href: string }[];
}

// TODO: Get role from auth context
function useCurrentRole(): string {
    const pathname = usePathname();
    if (pathname.startsWith("/mahasiswa")) return "mahasiswa";
    if (pathname.startsWith("/supervisor-akademik"))
        return "supervisor-akademik";
    if (pathname.startsWith("/manajer-tu")) return "manajer-tu";
    if (pathname.startsWith("/wakil-dekan-1")) return "wakil-dekan-1";
    if (pathname.startsWith("/upa")) return "upa";
    return "mahasiswa";
}

const roleMenuConfig: Record<string, MenuItem[]> = {
    mahasiswa: [
        {
            label: "Dasbor",
            href: "/mahasiswa",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Surat Saya",
            icon: <Mail size={20} />,
            submenu: [
                {
                    label: "Dalam Proses",
                    href: "/mahasiswa/surat/proses",
                },
                {
                    label: "Selesai",
                    href: "/mahasiswa/surat/selesai",
                },
            ],
        },
        {
            label: "Draft Surat",
            icon: <FileEdit size={20} />,
            submenu: [
                {
                    label: "Surat Rekomendasi Beasiswa",
                    href: "/mahasiswa/surat/draft/surat-rekomendasi-beasiswa",
                },
            ],
        },
        {
            label: "Profil Saya",
            href: "/mahasiswa/profile",
            icon: <User size={20} />,
        },
    ],
    "supervisor-akademik": [
        {
            label: "Dasbor",
            href: "/supervisor-akademik",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Surat Masuk",
            icon: <Mail size={20} />,
            submenu: [
                {
                    label: "Perlu Tindakan",
                    href: "/supervisor-akademik/surat/perlu-tindakan",
                },
                {
                    label: "Selesai",
                    href: "/supervisor-akademik/surat/selesai",
                },
            ],
        },
        {
            label: "Profil Saya",
            href: "/supervisor-akademik/profile",
            icon: <User size={20} />,
        },
    ],
    "manajer-tu": [
        {
            label: "Dasbor",
            href: "/manajer-tu",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Surat Masuk",
            icon: <Mail size={20} />,
            submenu: [
                {
                    label: "Perlu Tindakan",
                    href: "/manajer-tu/surat/perlu-tindakan",
                },
                {
                    label: "Selesai",
                    href: "/manajer-tu/surat/selesai",
                },
            ],
        },
        {
            label: "Profil Saya",
            href: "/manajer-tu/profile",
            icon: <User size={20} />,
        },
    ],
    "wakil-dekan-1": [
        {
            label: "Dasbor",
            href: "/wakil-dekan-1",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Surat Masuk",
            icon: <Mail size={20} />,
            submenu: [
                {
                    label: "Perlu Tindakan",
                    href: "/wakil-dekan-1/surat/perlu-tindakan",
                },
                {
                    label: "Selesai",
                    href: "/wakil-dekan-1/surat/selesai",
                },
            ],
        },
        {
            label: "Manajemen Tanda Tangan",
            href: "/wakil-dekan-1/manajemen-tanda-tangan",
            icon: <PenTool size={20} />,
        },
        {
            label: "Profil Saya",
            href: "/wakil-dekan-1/profile",
            icon: <User size={20} />,
        },
    ],
    upa: [
        {
            label: "Dasbor",
            href: "/upa",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Surat Masuk",
            icon: <Mail size={20} />,
            submenu: [
                {
                    label: "Perlu Tindakan",
                    href: "/upa/surat/perlu-tindakan",
                },
                {
                    label: "Selesai",
                    href: "/upa/surat/selesai",
                },
            ],
        },
        {
            label: "Arsip Surat",
            href: "/upa/arsip",
            icon: <Archive size={20} />,
        },
        {
            label: "Manajemen Penomoran",
            href: "/upa/manajemen-penomoran",
            icon: <FileEdit size={20} />,
        },
        {
            label: "Manajemen Stempel",
            href: "/upa/manajemen-stempel",
            icon: <Archive size={20} />,
        },
        {
            label: "Pengaturan Sistem",
            href: "/upa/pengaturan",
            icon: <Settings size={20} />,
        },
        {
            label: "Profil Saya",
            href: "/upa/profile",
            icon: <User size={20} />,
        },
    ],
};

export function Sidebar({
    className = "",
    isOpen = false,
    onClose,
    isCollapsed: propIsCollapsed = false,
    onToggleCollapse,
}: SidebarProps) {
    const { signOut } = useAuth();
    const pathname = usePathname();
    const role = useCurrentRole();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(propIsCollapsed);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (onToggleCollapse) {
            onToggleCollapse(newState);
        }
    };

    const menuItems = useMemo(() => {
        return roleMenuConfig[role] || roleMenuConfig.mahasiswa;
    }, [role]);

    const toggleMenu = (label: string) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    // Auto-expand menu if child is active
    useEffect(() => {
        menuItems.forEach((item) => {
            if (item.submenu) {
                const isActive = item.submenu.some(
                    (sub) => pathname === sub.href,
                );
                if (isActive) {
                    setExpandedMenu(item.label);
                }
            }
        });
    }, [pathname, menuItems]);

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === `/${role}`) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);

        try {
            await signOut();
            // Toast akan ditampilkan di login page setelah redirect
        } catch {
            toast.error("Gagal keluar dari akun. Silakan coba lagi");
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 print:hidden
                    fixed lg:fixed top-16 bottom-0 left-0 z-40 h-[calc(100vh-4rem)]
                    ${isCollapsed ? "w-20" : "w-64"}
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${className}`}
            >
                <nav
                    className={`flex-1 px-3 py-6 space-y-1 overflow-y-auto ${isCollapsed ? "flex flex-col items-center" : ""}`}
                >
                    {menuItems.map((item) => (
                        <div key={item.label}>
                            {item.submenu ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl group transition-colors ${
                                            expandedMenu === item.label
                                                ? "bg-gray-50 text-undip-blue"
                                                : "text-slate-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`${
                                                    expandedMenu === item.label
                                                        ? "text-undip-blue"
                                                        : "text-slate-400 group-hover:text-slate-600"
                                                }`}
                                            >
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && (
                                                <span className="font-medium text-sm">
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown
                                                size={18}
                                                className={`text-slate-400 transition-transform duration-200 ${
                                                    expandedMenu === item.label
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        )}
                                    </button>
                                    {!isCollapsed &&
                                        expandedMenu === item.label && (
                                            <div className="ml-9 mt-1 space-y-1">
                                                {item.submenu.map((sub) => (
                                                    <Link
                                                        key={sub.label}
                                                        href={sub.href}
                                                        onClick={
                                                            handleLinkClick
                                                        }
                                                        className={`block px-3 py-2 text-sm rounded-2xl transition-colors ${
                                                            pathname ===
                                                            sub.href
                                                                ? "text-white font-medium bg-undip-blue"
                                                                : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <Link
                                    href={item.href || "#"}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group font-medium transition-colors text-sm ${
                                        isActive(item.href)
                                            ? "bg-undip-blue text-white"
                                            : "text-slate-700 hover:bg-gray-100"
                                    } ${isCollapsed ? "justify-center" : ""}`}
                                    title={isCollapsed ? item.label : ""}
                                >
                                    <span
                                        className={`${
                                            isActive(item.href)
                                                ? "text-white"
                                                : "text-slate-500 group-hover:text-undip-blue"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && item.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Collapse Toggle Button - Positioned in the center of sidebar */}
                <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-4">
                    <button
                        onClick={toggleCollapse}
                        className="bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-sm"
                        title={
                            isCollapsed ? "Perluas sidebar" : "Tutup sidebar"
                        }
                    >
                        {isCollapsed ? (
                            <ChevronRight
                                size={18}
                                className="text-slate-600"
                            />
                        ) : (
                            <ChevronLeft size={18} className="text-slate-600" />
                        )}
                    </button>
                </div>

                <div
                    className={`shrink-0 px-4 py-6 border-t border-gray-100 ${isCollapsed ? "flex flex-col items-center" : ""}`}
                >
                    <button
                        onClick={handleLogoutClick}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors ${isCollapsed ? "justify-center" : "w-full"}`}
                        title={isCollapsed ? "Keluar" : ""}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && "Keluar"}
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900 text-left mb-2">
                                Konfirmasi Keluar
                            </DialogTitle>
                            <DialogDescription className="text-left text-base text-gray-600">
                                Apakah Anda yakin ingin keluar dari akun? Anda
                                perlu login kembali untuk mengakses sistem.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleLogoutCancel}
                            disabled={isLoggingOut}
                            className="flex-1 h-11 rounded-xl font-semibold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleLogoutConfirm}
                            disabled={isLoggingOut}
                            className="flex-1 h-11 rounded-xl font-semibold text-white"
                            style={{ backgroundColor: "#ef4444" }}
                        >
                            {isLoggingOut ? "Memproses..." : "Ya, Keluar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
