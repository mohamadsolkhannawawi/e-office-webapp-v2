"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle } from "lucide-react";
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
  const lbl = "text-xs font-semibold text-slate-700 uppercase tracking-wide";
  const inp = "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl max-h-[92dvh] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <UserCircle className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-800">
                Lengkapi Data Profil
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Lengkapi data berikut untuk menggunakan aplikasi. Semua field wajib diisi.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        {isLoadingDepts ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col"
          >
            <div className="space-y-4 flex-1">
              {/* Row 1: NIM and No HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data?.isMahasiswa && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nim" className={lbl}>
                      NIM <span className="text-red-500 normal-case">*</span>
                    </Label>
                    <Input
                      id="nim"
                      placeholder="Contoh: 24060122140123"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      pattern="\d{14}"
                      title="NIM harus tepat 14 digit angka"
                      className={inp}
                      required
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="noHp" className={lbl}>
                    Nomor HP <span className="text-red-500 normal-case">*</span>
                  </Label>
                  <Input
                    id="noHp"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    pattern="^08[0-9]{8,13}$"
                    title="Nomor HP harus diawali 08 dan 10–15 digit"
                    className={inp}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Tahun Masuk and Tempat Lahir */}
              {data?.isMahasiswa && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tahunMasuk" className={lbl}>
                      Tahun Masuk <span className="text-red-500 normal-case">*</span>
                    </Label>
                    <Input
                      id="tahunMasuk"
                      type="number"
                      placeholder={`Contoh: ${currentYear - 1}`}
                      value={tahunMasuk}
                      onChange={(e) => setTahunMasuk(e.target.value)}
                      min="1990"
                      max={String(currentYear)}
                      className={inp}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tempatLahir" className={lbl}>
                      Tempat Lahir <span className="text-red-500 normal-case">*</span>
                    </Label>
                    <Input
                      id="tempatLahir"
                      placeholder="Contoh: Semarang"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      className={inp}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Row 3: Tanggal Lahir (and possibly empty slot if needed) */}
              {data?.isMahasiswa && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tanggalLahir" className={lbl}>
                      Tanggal Lahir <span className="text-red-500 normal-case">*</span>
                    </Label>
                    <Input
                      id="tanggalLahir"
                      type="date"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      max={`${currentYear - 15}-12-31`}
                      className={inp}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Row 4: Departemen and Program Studi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="departemenId" className={lbl}>
                    Departemen <span className="text-red-500 normal-case">*</span>
                  </Label>
                  <select
                    id="departemenId"
                    value={departemenId}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    required
                    className={inp}
                  >
                    <option value="">-- Pilih Departemen --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="programStudiId" className={lbl}>
                    Program Studi <span className="text-red-500 normal-case">*</span>
                  </Label>
                  <select
                    id="programStudiId"
                    value={programStudiId}
                    onChange={(e) => setProgramStudiId(e.target.value)}
                    required
                    disabled={!departemenId}
                    className={inp}
                  >
                    <option value="">-- Pilih Program Studi --</option>
                    {availableProdi.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {!departemenId && (
                    <p className="text-xs text-slate-500 mt-1">
                      Pilih departemen terlebih dahulu
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Submit Button */}
            <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 flex-1 order-2 sm:order-1 text-center sm:text-left">
                Data profil digunakan untuk validasi dan personalisasi layanan.
              </p>
              <Button
                type="submit"
                className="w-full sm:w-auto rounded-xl px-8 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition order-1 sm:order-2 shrink-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Profil"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
