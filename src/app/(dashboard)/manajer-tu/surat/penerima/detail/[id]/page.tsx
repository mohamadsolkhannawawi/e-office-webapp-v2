"use client";

import { use } from "react";
import { AdminDetailSurat } from "@/components/features/admin-detail-surat";

export default function ManajerTUDetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <AdminDetailSurat role="manajer-tu" id={id} />;
}
