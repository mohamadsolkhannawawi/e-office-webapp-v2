"use client";

import { use } from "react";
import { AdminDetailSurat } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/AdminDetailSurat";

export default function UPADetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <AdminDetailSurat role="upa" id={id} />;
}
