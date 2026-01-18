"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Mail,
    FileEdit,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";

interface SidebarProps {
    className?: string;
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
                { label: "Dalam Proses", href: "/mahasiswa/surat/proses" },
                { label: "Sudah Selesai", href: "/mahasiswa/surat/selesai" },
            ],
        },
        {
            label: "Draft Surat",
            icon: <FileEdit size={20} />,
            submenu: [
                {
                    label: "Draf Rekomendasi",
                    href: "/mahasiswa/draft/rekomendasi",
                },
            ],
        },
    ],
    "supervisor-akademik": [
        {
            label: "Dasbor",
            href: "/supervisor-akademik",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Verifikasi Surat",
            href: "/supervisor-akademik/verifikasi",
            icon: <Mail size={20} />,
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
            href: "/manajer-tu/incoming",
            icon: <Mail size={20} />,
        },
    ],
    "wakil-dekan-1": [
        {
            label: "Dasbor",
            href: "/wakil-dekan-1",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Persetujuan",
            href: "/wakil-dekan-1/approval",
            icon: <Mail size={20} />,
        },
    ],
    upa: [
        {
            label: "Dasbor",
            href: "/upa",
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Manajemen",
            href: "/upa/manajemen",
            icon: <Mail size={20} />,
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

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === `/${role}`) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`w-64 bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-200 ${className}`}
        >
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <div key={item.label}>
                        {item.submenu ? (
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md group transition-colors ${
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
                                        <span className="font-medium text-sm">
                                            {item.label}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`text-slate-400 transition-transform duration-200 ${
                                            expandedMenu === item.label
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {expandedMenu === item.label && (
                                    <div className="ml-9 mt-1 space-y-1">
                                        {item.submenu.map((sub) => (
                                            <Link
                                                key={sub.label}
                                                href={sub.href}
                                                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                                    pathname === sub.href
                                                        ? "text-undip-blue font-medium bg-blue-50/50"
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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md group font-medium transition-colors text-sm ${
                                    isActive(item.href)
                                        ? "bg-gray-100 text-undip-blue"
                                        : "text-slate-700 hover:bg-gray-100"
                                }`}
                            >
                                <span
                                    className={`${
                                        isActive(item.href)
                                            ? "text-undip-blue"
                                            : "text-slate-500 group-hover:text-undip-blue"
                                    }`}
                                >
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <LogOut size={20} />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
