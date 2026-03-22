// Import ikon dihapus karena kita mengembalikan nama ikon dalam bentuk string
// Komponen pemakai (RiwayatSurat) menangani proses render ikonnya

export interface StatusConfig {
  label: string;
  color: string;
  /** Background solid + warna teks untuk lingkaran titik timeline */
  dotColor: string;
  defaultDesc: string;
  iconName:
    | "FileText"
    | "CheckCircle2"
    | "Clock"
    | "XCircle"
    | "RotateCcw"
    | "Check"
    | "PencilLine";
}

// Fungsi bantu untuk memformat nama role agar lebih ramah dan sopan
export function formatRoleName(role: string): string {
  const lower = role.toLowerCase();
  // Tangani nama bergaya konstanta (mis., WAKIL_DEKAN_1, SUPERVISOR_AKADEMIK)
  if (
    lower.includes("wakil") &&
    (lower.includes("dekan") || lower.includes("wd1"))
  )
    return "Wakil Dekan 1";
  if (
    lower.includes("manajer") ||
    (lower.includes("tu") && !lower.includes("status"))
  )
    return "Manajer TU";
  if (lower.includes("supervisor") || lower.includes("spv"))
    return "Supervisor Akademik";
  if (lower.includes("upa") || lower.includes("staff")) return "Staff UPA";
  if (lower.includes("mahasiswa") || lower.includes("mhs")) return "Mahasiswa";
  if (
    lower.includes("super_admin") ||
    lower.includes("super admin") ||
    lower === "super-admin"
  )
    return "Administrator Sistem";
  return role; // Cadangan
}

// Fungsi bantu untuk menentukan konfigurasi (label, warna, deskripsi) berdasarkan status/action
export function getStatusConfig(
  status: string,
  actionType?: string,
  sender?: string,
  receiver?: string,
): StatusConfig {
  const s = status.toLowerCase();
  const a = actionType?.toLowerCase() || "";
  const senderRole = sender ? formatRoleName(sender) : "Reviewer";

  // Kondisi status COMPLETED / PUBLISHED
  if (
    s === "completed" ||
    s === "published" ||
    s.includes("selesai") ||
    s.includes("terbit")
  ) {
    return {
      label: "Selesai / Terbit",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      dotColor: "bg-emerald-500 text-white ring-2 ring-emerald-200",
      iconName: "CheckCircle2",
      defaultDesc: "Dokumen telah selesai, ditandatangani, dan diterbitkan.",
    };
  }

  // Kondisi status PENDING / SUBMITTED / DIAJUKAN
  if (s === "pending" || s.includes("diajukan") || s === "submitted") {
    return {
      label: "Diajukan",
      color: "text-slate-600 bg-slate-50 border-slate-100",
      dotColor: "bg-slate-400 text-white",
      iconName: "FileText",
      defaultDesc: "Dokumen sedang menunggu review di tahap berikutnya.",
    };
  }

  // Kondisi status REJECTED
  if (s === "rejected" || s.includes("tolak")) {
    return {
      label: "Ditolak",
      color: "text-red-600 bg-red-50 border-red-100",
      dotColor: "bg-red-500 text-white ring-2 ring-red-200",
      iconName: "XCircle",
      defaultDesc: `Pengajuan ditolak oleh ${senderRole}.`,
    };
  }

  // Kondisi status REVISION / REVISED
  if (s === "revision" || s === "revised" || s.includes("revisi")) {
    // Tambahkan nama penerima hanya jika bukan "-" (penerima tidak diketahui)
    const label =
      receiver && receiver !== "-" ? `Revisi ke ${receiver}` : "Perlu Revisi";
    const defaultDesc =
      receiver && receiver !== "-"
        ? `Dokumen dikembalikan oleh ${senderRole} untuk diperbaiki oleh ${receiver}.`
        : `Dokumen dikembalikan oleh ${senderRole} untuk diperbaiki.`;
    return {
      label,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      dotColor: "bg-amber-400 text-white ring-2 ring-amber-100",
      iconName: "RotateCcw",
      defaultDesc,
    };
  }

  // Kondisi action APPROVE
  if (a === "approve") {
    let desc = `Dokumen telah disetujui oleh ${senderRole} dan diteruskan ke tahap berikutnya.`;

    if (senderRole === "Wakil Dekan 1") {
      desc = "Dokumen telah disetujui dan ditandatangani secara digital.";
    } else if (senderRole === "Staff UPA") {
      desc = "Dokumen telah diterbitkan dan dapat diunduh.";
    }

    return {
      label: "Disetujui",
      color: "text-green-600 bg-green-50 border-green-100",
      dotColor: "bg-green-500 text-white ring-2 ring-green-200",
      iconName: "Check",
      defaultDesc: desc,
    };
  }

  // Kondisi action RESUBMIT
  if (a === "resubmit") {
    return {
      label: "Revisi Selesai",
      color: "text-teal-600 bg-teal-50 border-teal-100",
      dotColor: "bg-teal-500 text-white",
      iconName: "FileText",
      defaultDesc:
        "Revisi telah selesai dan pengajuan disubmit ulang untuk ditinjau kembali.",
    };
  }

  // Kondisi action STUDENT_REVISION (edit mandiri sebelum supervisor memproses)
  if (a === "student_revision") {
    return {
      label: "Revisi oleh Mahasiswa",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      dotColor: "bg-amber-400 text-white ring-2 ring-amber-100",
      iconName: "RotateCcw",
      defaultDesc:
        "Mahasiswa melakukan revisi mandiri sebelum Supervisor Akademik memproses surat.",
    };
  }

  // Kondisi action STAFF_REVISION (Supervisor Akademik / Manajer TU mengedit data surat)
  if (a === "staff_revision") {
    return {
      label: "Edit oleh Staff",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      dotColor: "bg-indigo-500 text-white",
      iconName: "PencilLine",
      defaultDesc:
        "Data surat diperbarui oleh Supervisor Akademik atau Manajer TU.",
    };
  }

  // Kondisi action SUBMIT
  if (a === "submit" || a === "create" || s === "pending") {
    return {
      label: "Diajukan",
      color: "text-blue-600 bg-blue-50 border-blue-100",
      dotColor: "bg-blue-400 text-white",
      iconName: "FileText",
      defaultDesc: "Pengajuan baru telah berhasil dikirim.",
    };
  }

  // Kondisi cadangan / dalam proses
  return {
    label: "Diproses",
    color: "text-slate-600 bg-slate-50 border-slate-100",
    dotColor: "bg-slate-400 text-white",
    iconName: "Clock",
    defaultDesc: "Dokumen sedang diproses di tahap ini.",
  };
}

// Fungsi bantu untuk menentukan role penerima berdasarkan action, role pengirim, dan catatan
export function getReceiverRole(
  action: string,
  currentStep?: number,
  catatan?: string,
  senderRole?: string,
): string {
  const actionLower = action?.toLowerCase() || "";

  // Turunkan step dari role pengirim jika tersedia
  let inferredStep: number | null = null;
  if (senderRole) {
    const senderLower = senderRole.toLowerCase();
    if (senderLower.includes("supervisor")) inferredStep = 1;
    else if (senderLower.includes("manajer") || senderLower.includes("tu"))
      inferredStep = 2;
    else if (
      senderLower.includes("wakil") ||
      senderLower.includes("dekan") ||
      senderLower.includes("wd1")
    )
      inferredStep = 3;
    else if (senderLower.includes("upa")) inferredStep = 4;
  }

  const stepForMapping = inferredStep ?? currentStep ?? 1;

  if (actionLower === "approve") {
    // Pemetaan tahap: backend menggunakan penomoran berbasis 1
    // Tahap 1 (SPV) approve -> lanjut ke Tahap 2 (Manajer TU)
    // Tahap 2 (TU) approve -> lanjut ke Tahap 3 (Wakil Dekan 1)
    // Tahap 3 (WD1) approve -> lanjut ke Tahap 4 (UPA/Publish)
    // Tahap 4 (UPA) approve -> COMPLETED
    const stepToRole: Record<number, string> = {
      1: "Manajer TU", // SPV (tahap 1) approve -> TU (tahap 2)
      2: "Wakil Dekan 1", // TU (tahap 2) approve -> WD1 (tahap 3)
      3: "Staff UPA", // WD1 (tahap 3) approve -> UPA (tahap 4)
      4: "Selesai", // UPA (tahap 4) publish -> COMPLETED
    };
    return stepToRole[stepForMapping] || "-";
  } else if (actionLower === "revision") {
    // Coba ekstrak role tujuan dari catatan jika tersedia
    if (catatan) {
      // Pertama coba ekstrak dari format [ke RoleName] (ditambahkan backend)
      const bracketMatch = catatan.match(/\[ke\s+([^\]]+)\]/i);
      if (bracketMatch && bracketMatch[1]) {
        return bracketMatch[1].trim();
      }

      // Cek singkatan role di catatan - gunakan kemunculan pertama
      const catatanLower = catatan.toLowerCase();

      // Cari pola seperti "Revisi WD1 - SPV - MHS..." dan ambil role KEDUA yang disebut
      // (yang pertama adalah pemberi revisi, yang kedua adalah tujuan revisi)
      const parts = catatanLower.split("-").map((p) => p.trim());
      if (parts.length >= 2) {
        // Lewati bagian pertama (pemberi revisi), lalu cek bagian berikutnya
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (part.includes("spv")) return "Supervisor Akademik";
          if (part.includes("tu")) return "Manajer TU";
          if (part.includes("wd1")) return "Wakil Dekan 1";
          if (part.includes("mhs")) return "Mahasiswa";
        }
      }

      // Cadangan: cek di seluruh isi catatan
      if (catatanLower.includes("spv")) return "Supervisor Akademik";
      if (catatanLower.includes("tu")) return "Manajer TU";
      if (catatanLower.includes("wd1")) return "Wakil Dekan 1";
      if (catatanLower.includes("mhs")) return "Mahasiswa";
    }
    return "-";
  } else if (actionLower === "reject") {
    return "Ditolak";
  } else if (actionLower === "resubmit") {
    // Setelah revisi selesai, dokumen kembali ke role pada step yang ditentukan
    // Menggunakan nomor step berbasis 1 sesuai backend
    const stepToRole: Record<number, string> = {
      1: "Supervisor Akademik", // Resubmitted to SPV
      2: "Manajer TU", // Resubmitted to TU
      3: "Wakil Dekan 1", // Resubmitted to WD1
      4: "Staff UPA", // Resubmitted to UPA
    };
    return stepToRole[stepForMapping] || "-";
  }

  // Revisi mandiri mahasiswa: tetap di Supervisor Akademik
  if (actionLower === "student_revision") {
    return "Supervisor Akademik";
  }

  // Revisi staff: tetap pada role yang sama (edit mandiri)
  if (actionLower === "staff_revision") {
    if (senderRole?.toLowerCase().includes("supervisor"))
      return "Supervisor Akademik";
    if (
      senderRole?.toLowerCase().includes("manajer") ||
      senderRole?.toLowerCase().includes("tu")
    )
      return "Manajer TU";
    return "Staff";
  }

  return "-";
}
