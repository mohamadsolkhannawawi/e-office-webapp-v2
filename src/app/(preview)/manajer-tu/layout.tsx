"use client";

import { Navbar } from "@/components/layout/Navbar";
// import { getLetterConfig, LeadershipConfig } from "@/lib/application-api";
// import { useEffect, useState } from "react";

export default function ManajerTUPreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Removed fetching of MANAJER config as Navbar handles user data via AuthContext

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
