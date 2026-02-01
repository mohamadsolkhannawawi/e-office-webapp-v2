"use client";

import { Navbar } from "@/components/layout/Navbar";

export default function WD1PreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
