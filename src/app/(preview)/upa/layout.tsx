"use client";

import { Navbar } from "@/components/layout/Navbar";
import { getLetterConfig, LeadershipConfig } from "@/lib/application-api";
import { useEffect, useState } from "react";

export default function UPAPreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [upaConfig, setUpaConfig] = useState<LeadershipConfig | null>(null);

    useEffect(() => {
        const fetchUPAConfig = async () => {
            const config = await getLetterConfig("UPA");
            if (config) {
                setUpaConfig(config);
            }
        };
        fetchUPAConfig();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar userName={upaConfig?.name || ""} />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
