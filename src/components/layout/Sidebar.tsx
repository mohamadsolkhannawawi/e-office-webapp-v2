"use client";

import React from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
    Users,
    Shield,
    Database,
    FileText,
    FolderKanban,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
    if (pathname.startsWith("/super-admin")) return "super-admin";
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
                {
                    label: "Surat Rekomendasi Keperluan Lain",
                    href: "/mahasiswa/surat/draft/surat-rekomendasi-beasiswa?jenis=keperluan_lain",
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
    "super-admin": [
        {
            label: "Dasbor",
            href: "/super-admin",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Manajemen Surat",
            href: "/super-admin/surat",
            icon: <Mail size={20} />,
        },
        {
            label: "Kelola Pengguna",
            icon: <Users size={20} />,
            submenu: [
                {
                    label: "Semua Pengguna",
                    href: "/super-admin/kelola-pengguna",
                },
                {
                    label: "Tambah Pengguna",
                    href: "/super-admin/kelola-pengguna/buat",
                },
            ],
        },
        {
            label: "Kelola Peran",
            href: "/super-admin/kelola-peran",
            icon: <Shield size={20} />,
        },
        {
            label: "Master Data",
            icon: <Database size={20} />,
            submenu: [
                {
                    label: "Departemen",
                    href: "/super-admin/master-data/departemen",
                },
                {
                    label: "Program Studi",
                    href: "/super-admin/master-data/prodi",
                },
            ],
        },
        {
            label: "Audit Log",
            href: "/super-admin/audit-log",
            icon: <FileText size={20} />,
        },
        {
            label: "Pengaturan Sistem",
            href: "/super-admin/pengaturan-sistem",
            icon: <Settings size={20} />,
        },
        {
            label: "Manajemen Dokumen",
            href: "/super-admin/manajemen-dokumen",
            icon: <FolderKanban size={20} />,
        },
        {
            label: "Profil Saya",
            href: "/super-admin/profil",
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
    const searchParams = useSearchParams();
    const currentSearch = searchParams.toString(); // e.g. "jenis=keperluan_lain"
    const role = useCurrentRole();

    // Helper: match a submenu href (may include query params) against the current URL
    const isSubActive = (href: string) => {
        const qIdx = href.indexOf("?");
        if (qIdx === -1) return pathname === href;
        const hrefPath = href.slice(0, qIdx);
        const hrefSearch = href.slice(qIdx + 1);
        return pathname === hrefPath && currentSearch === hrefSearch;
    };
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
                const isActive = item.submenu.some((sub) =>
                    isSubActive(sub.href),
                );
                if (isActive) {
                    setExpandedMenu(item.label);
                }
            }
        });
    }, [pathname, currentSearch, menuItems]);

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
                                                            isSubActive(
                                                                sub.href,
                                                            )
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
                                    onClick={handleLogoutCancel}
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
