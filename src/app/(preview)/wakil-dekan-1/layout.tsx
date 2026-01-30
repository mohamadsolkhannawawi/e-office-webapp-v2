"use client";

import { Navbar } from "@/components/layout/Navbar";
import { getLetterConfig, LeadershipConfig } from "@/lib/application-api";
import { useEffect, useState } from "react";

export default function WD1PreviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [wd1Config, setWd1Config] = useState<LeadershipConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getLetterConfig("WAKIL_DEKAN_1");
            if (config) {
                setWd1Config(config);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar userName={wd1Config?.name || ""} />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
