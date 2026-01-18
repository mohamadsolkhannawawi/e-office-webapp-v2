"use client";

import { use } from "react";
import { AdminDetailSurat } from "@/components/features/admin-detail-surat";

export default function UPADetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <AdminDetailSurat role="upa" id={id} />;
}
