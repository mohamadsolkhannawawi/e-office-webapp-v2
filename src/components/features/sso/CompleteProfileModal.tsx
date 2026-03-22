"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface ProgramStudi {
  id: string;
  name: string;
}

interface Departemen {
  id: string;
  name: string;
  programStudi: ProgramStudi[];
}

interface ProfileIncomplete {
  isIncomplete: boolean;
  missingFields: string[];
  isMahasiswa: boolean;
  isPegawai: boolean;
  profile: {
    mahasiswa?: {
      nim: string;
      noHp: string;
      tahunMasuk: string;
      departemenId: string;
      programStudiId: string;
      tempatLahir?: string;
      tanggalLahir?: string;
    } | null;
    pegawai?: { nip: string; noHp: string } | null;
  };
}

export default function CompleteProfileModal() {
  const onComplete = () => window.location.reload();
  const [status, setStatus] = useState<"checking" | "incomplete" | "done">(
    "checking",
  );
  const [data, setData] = useState<ProfileIncomplete | null>(null);

  // Field states
  const [nim, setNim] = useState("");
  const [noHp, setNoHp] = useState("");
  const [tahunMasuk, setTahunMasuk] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [departemenId, setDepartemenId] = useState("");
  const [programStudiId, setProgramStudiId] = useState("");

  const [departments, setDepartments] = useState<Departemen[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableProdi =
    departments.find((d) => d.id === departemenId)?.programStudi ?? [];

  // 1. Check profile completeness on mount
  useEffect(() => {
    fetch(`${BASE_PATH}/api/me/profile-incomplete`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res: ProfileIncomplete) => {
        if (!res.isIncomplete) {
          setStatus("done");
          return;
        }
        // Pre-populate fields that already have valid values
        const mhs = res.profile.mahasiswa;
        if (mhs) {
          setNim(/^\d{14}$/.test(mhs.nim) ? mhs.nim : "");
          setNoHp(mhs.noHp && mhs.noHp !== "-" ? mhs.noHp : "");
          setTahunMasuk(mhs.tahunMasuk ?? "");
          setTempatLahir(mhs.tempatLahir ?? "");
          setTanggalLahir(
            mhs.tanggalLahir
              ? new Date(mhs.tanggalLahir).toISOString().split("T")[0]
              : "",
          );
          setDepartemenId(mhs.departemenId ?? "");
          setProgramStudiId(mhs.programStudiId ?? "");
        }
        setData(res);
        setStatus("incomplete");
      })
      .catch(() => setStatus("done")); // jika gagal, jangan blokir user
  }, []);

  // 2. Load departments when modal becomes visible
  useEffect(() => {
    if (status !== "incomplete") return;
    fetch(`${BASE_PATH}/api/me/departments`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => setDepartments(res.departments ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setIsLoadingDepts(false));
  }, [status]);

  const handleDeptChange = (id: string) => {
    setDepartemenId(id);
    setProgramStudiId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSubmitting(true);
    try {
      const body: Record<string, any> = {};
      if (data.isMahasiswa) {
        body.nim = nim;
        body.noHp = noHp;
        body.tahunMasuk = tahunMasuk;
        body.tempatLahir = tempatLahir;
        if (tanggalLahir) body.tanggalLahir = tanggalLahir;
        body.departemenId = departemenId;
        body.programStudiId = programStudiId;
      } else if (data.isPegawai) {
        body.noHp = noHp;
        body.departemenId = departemenId;
        body.programStudiId = programStudiId;
      }

      const res = await fetch(`${BASE_PATH}/api/me/complete-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan profil.");

      toast.success("Profil berhasil dilengkapi!");
      setStatus("done");
      // Reload so the dashboard picks up the completed profile
      setTimeout(onComplete, 500);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything if still checking or already complete
  if (status !== "incomplete") return null;

  const currentYear = new Date().getFullYear();
  const inputClassName =
    "h-11 rounded-xl border-border/80 bg-background shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary";
  const selectClassName =
    "flex h-11 w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50";
  const labelClassName =
    "text-[13px] font-semibold tracking-wide text-foreground/90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl flex flex-col">
        <div className="h-1.5 w-full bg-linear-to-r from-(--color-undip-blue) via-primary to-(--color-dark-navy)" />
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-border/70 bg-linear-to-b from-muted/30 to-transparent">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Lengkapi Data Profil
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Lengkapi data berikut untuk menggunakan aplikasi. Semua field wajib
            diisi.
          </p>
        </div>

        {/* Body */}
        {isLoadingDepts ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-(--color-undip-blue)" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-5 overflow-y-auto bg-linear-to-b from-background to-muted/20 px-8 py-6"
          >
            {/* NIM — khusus mahasiswa */}
            {data?.isMahasiswa && (
              <div className="space-y-2">
                <Label htmlFor="nim" className={labelClassName}>
                  NIM <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nim"
                  placeholder="14 digit angka, contoh: 24060122140123"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  pattern="\d{14}"
                  title="NIM harus tepat 14 digit angka"
                  className={inputClassName}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nomor Induk Mahasiswa 14 digit
                </p>
              </div>
            )}

            {/* Nomor HP */}
            <div className="space-y-2">
              <Label htmlFor="noHp" className={labelClassName}>
                Nomor HP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="noHp"
                type="tel"
                placeholder="Contoh: 08123456789"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                pattern="^08[0-9]{8,13}$"
                title="Nomor HP harus diawali 08 dan 10–15 digit"
                className={inputClassName}
                required
              />
            </div>

            {/* Tahun Masuk — khusus mahasiswa */}
            {data?.isMahasiswa && (
              <div className="space-y-2">
                <Label htmlFor="tahunMasuk" className={labelClassName}>
                  Tahun Masuk <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tahunMasuk"
                  type="number"
                  placeholder={`Contoh: ${currentYear - 1}`}
                  value={tahunMasuk}
                  onChange={(e) => setTahunMasuk(e.target.value)}
                  min="1990"
                  max={String(currentYear)}
                  className={inputClassName}
                  required
                />
              </div>
            )}

            {/* Tempat Lahir — khusus mahasiswa */}
            {data?.isMahasiswa && (
              <div className="space-y-2">
                <Label htmlFor="tempatLahir" className={labelClassName}>
                  Tempat Lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tempatLahir"
                  placeholder="Contoh: Semarang"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
            )}

            {/* Tanggal Lahir — khusus mahasiswa */}
            {data?.isMahasiswa && (
              <div className="space-y-2">
                <Label htmlFor="tanggalLahir" className={labelClassName}>
                  Tanggal Lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tanggalLahir"
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  max={`${currentYear - 15}-12-31`}
                  className={inputClassName}
                  required
                />
              </div>
            )}

            {/* Departemen */}
            <div className="space-y-2">
              <Label htmlFor="departemenId" className={labelClassName}>
                Departemen <span className="text-destructive">*</span>
              </Label>
              <select
                id="departemenId"
                value={departemenId}
                onChange={(e) => handleDeptChange(e.target.value)}
                required
                className={selectClassName}
              >
                <option value="">-- Pilih Departemen --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Program Studi — cascade */}
            <div className="space-y-2">
              <Label htmlFor="programStudiId" className={labelClassName}>
                Program Studi <span className="text-destructive">*</span>
              </Label>
              <select
                id="programStudiId"
                value={programStudiId}
                onChange={(e) => setProgramStudiId(e.target.value)}
                required
                disabled={!departemenId}
                className={selectClassName}
              >
                <option value="">-- Pilih Program Studi --</option>
                {availableProdi.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {!departemenId && (
                <p className="text-xs text-muted-foreground">
                  Pilih departemen terlebih dahulu
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-3">
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan & Masuk ke Aplikasi"
                )}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Data profil digunakan untuk validasi dan personalisasi layanan.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
