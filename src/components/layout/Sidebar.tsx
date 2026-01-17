"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    FileText,
    CheckSquare,
    Inbox,
    Send,
    GraduationCap,
    BarChart3,
    History,
    ChevronRight,
    Settings,
} from "lucide-react";
import { useState, useMemo } from "react";

interface SidebarProps {
    className?: string;
}

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    submenu?: { label: string; href: string }[];
}

// TODO: Get role from auth context
function useCurrentRole(): string {
    // Detect role from current path
    const pathname = usePathname();
    if (pathname.startsWith("/mahasiswa")) return "mahasiswa";
    if (pathname.startsWith("/supervisor-akademik"))
        return "supervisor-akademik";
    if (pathname.startsWith("/manajer-tu")) return "manajer-tu";
    if (pathname.startsWith("/wakil-dekan-1")) return "wakil-dekan-1";
    if (pathname.startsWith("/upa")) return "upa";
    return "mahasiswa"; // Default role
}

// Menu items per role
const roleMenuConfig: Record<string, MenuItem[]> = {
    mahasiswa: [
        {
            label: "Dashboard",
            href: "/mahasiswa",
            icon: <Home size={18} />,
        },
        {
            label: "Surat Rekomendasi Beasiswa",
            href: "/mahasiswa/surat-rekomendasi-beasiswa",
            icon: <FileText size={18} />,
        },
        {
            label: "Riwayat Pengajuan",
            href: "/mahasiswa/riwayat",
            icon: <History size={18} />,
        },
    ],
    "supervisor-akademik": [
        {
            label: "Dashboard",
            href: "/supervisor-akademik",
            icon: <Home size={18} />,
        },
        {
            label: "Verifikasi",
            href: "/supervisor-akademik/verifikasi",
            icon: <CheckSquare size={18} />,
        },
        {
            label: "Riwayat",
            href: "/supervisor-akademik/riwayat",
            icon: <History size={18} />,
        },
    ],
    "manajer-tu": [
        {
            label: "Dashboard",
            href: "/manajer-tu",
            icon: <Home size={18} />,
        },
        {
            label: "Surat Masuk",
            href: "/manajer-tu/incoming",
            icon: <Inbox size={18} />,
        },
        {
            label: "Surat Keluar",
            href: "/manajer-tu/outgoing",
            icon: <Send size={18} />,
        },
    ],
    "wakil-dekan-1": [
        {
            label: "Dashboard",
            href: "/wakil-dekan-1",
            icon: <Home size={18} />,
        },
        {
            label: "Approval",
            href: "/wakil-dekan-1/approval",
            icon: <CheckSquare size={18} />,
        },
        {
            label: "Laporan",
            href: "/wakil-dekan-1/laporan",
            icon: <BarChart3 size={18} />,
        },
    ],
    upa: [
        {
            label: "Dashboard",
            href: "/upa",
            icon: <Home size={18} />,
        },
        {
            label: "Manajemen Beasiswa",
            href: "/upa/manajemen-beasiswa",
            icon: <GraduationCap size={18} />,
        },
        {
            label: "Laporan",
            href: "/upa/laporan",
            icon: <BarChart3 size={18} />,
        },
        {
            label: "Pengaturan",
            href: "/upa/pengaturan",
            icon: <Settings size={18} />,
        },
    ],
};

export function Sidebar({ className = "" }: SidebarProps) {
    const pathname = usePathname();
    const role = useCurrentRole();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const menuItems = useMemo(() => {
        return roleMenuConfig[role] || roleMenuConfig.mahasiswa;
    }, [role]);

    const toggleMenu = (label: string) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const isActive = (href: string) => {
        if (href === `/${role}`) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`w-64 bg-white border-r border-gray-200 min-h-screen ${className}`}
        >
            <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                    <div key={item.label}>
                        {/* Menu Item */}
                        {item.submenu ? (
                            <button
                                onClick={() => toggleMenu(item.label)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    expandedMenu === item.label
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                <ChevronRight
                                    size={16}
                                    className={`transition-transform ${
                                        expandedMenu === item.label
                                            ? "rotate-90"
                                            : ""
                                    }`}
                                />
                            </button>
                        ) : (
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(item.href)
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        )}

                        {/* Submenu */}
                        {item.submenu && expandedMenu === item.label && (
                            <div className="ml-4 mt-1 space-y-1">
                                {item.submenu.map((subitem) => (
                                    <Link
                                        key={subitem.label}
                                        href={subitem.href}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                            pathname === subitem.href
                                                ? "bg-blue-50 text-blue-600 font-medium"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                        <span>{subitem.label}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
