"use client";

import { use } from "react";
import { AdminDetailSurat } from "@/components/features/admin-detail-surat";

export default function WD1DetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <AdminDetailSurat role="wakil-dekan-1" id={id} />;
}
