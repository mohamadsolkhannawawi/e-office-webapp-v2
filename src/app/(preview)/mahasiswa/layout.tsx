"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function MahasiswaPreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar userName={user?.name || ""} />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
