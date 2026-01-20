"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar userName={user?.name || "User"} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 bg-slate-50 overflow-auto lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
