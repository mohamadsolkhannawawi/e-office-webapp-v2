"use client";

import { Navbar } from "@/components/layout/Navbar";
import { getLetterConfig, LeadershipConfig } from "@/lib/application-api";
import { useEffect, useState } from "react";

export default function ManajerTUPreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [manajerConfig, setManajerConfig] = useState<LeadershipConfig | null>(
        null,
    );

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getLetterConfig("MANAJER");
            if (config) {
                setManajerConfig(config);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar userName={manajerConfig?.name || ""} />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
