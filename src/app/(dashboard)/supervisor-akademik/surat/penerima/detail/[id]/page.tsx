"use client";

import { use } from "react";
import { AdminDetailSurat } from "@/components/features/admin-detail-surat";

export default function SupervisorDetailSuratPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <AdminDetailSurat role="supervisor-akademik" id={id} />;
}
