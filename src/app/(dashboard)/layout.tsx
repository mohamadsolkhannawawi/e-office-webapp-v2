"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const userName = useMemo(() => {
        if (pathname.startsWith("/supervisor-akademik"))
            return "Supervisor Akademik";
        if (pathname.startsWith("/manajer-tu")) return "Manajer TU";
        if (pathname.startsWith("/wakil-dekan-1")) return "Wakil Dekan 1";
        if (pathname.startsWith("/upa")) return "UPA";
        return "Mahasiswa";
    }, [pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar userName={userName} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 bg-slate-50 overflow-auto lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
