"use client";

import { Navbar } from "@/components/layout/Navbar";
import { getLetterConfig, LeadershipConfig } from "@/lib/application-api";
import { useEffect, useState } from "react";

export default function SupervisorPreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [supervisorConfig, setSupervisorConfig] =
        useState<LeadershipConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getLetterConfig("SUPERVISOR");
            if (config) {
                setSupervisorConfig(config);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar userName={supervisorConfig?.name || ""} />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
