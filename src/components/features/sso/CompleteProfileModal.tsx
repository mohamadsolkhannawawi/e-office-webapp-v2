"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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
        fetch("/persuratan-rekomendasi/api/me/profile-incomplete", {
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
        fetch("/persuratan-rekomendasi/api/me/departments", {
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

            const res = await fetch(
                "/persuratan-rekomendasi/api/me/complete-profile",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body),
                },
            );

            const json = await res.json().catch(() => ({}));
            if (!res.ok)
                throw new Error(json.error || "Gagal menyimpan profil.");

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

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        Lengkapi Data Profil
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Lengkapi data berikut untuk menggunakan aplikasi.
                        Semua field wajib diisi.
                    </p>
                </div>

                {/* Body */}
                {isLoadingDepts ? (
                    <div className="flex items-center justify-center flex-1 p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="overflow-y-auto flex-1 px-8 py-6 space-y-5"
                    >
                        {/* NIM — khusus mahasiswa */}
                        {data?.isMahasiswa && (
                            <div className="space-y-1">
                                <Label htmlFor="nim">
                                    NIM{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nim"
                                    placeholder="14 digit angka, contoh: 24060122140123"
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                    pattern="\d{14}"
                                    title="NIM harus tepat 14 digit angka"
                                    required
                                />
                                <p className="text-xs text-gray-400">
                                    Nomor Induk Mahasiswa 14 digit
                                </p>
                            </div>
                        )}

                        {/* Nomor HP */}
                        <div className="space-y-1">
                            <Label htmlFor="noHp">
                                Nomor HP{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="noHp"
                                type="tel"
                                placeholder="Contoh: 08123456789"
                                value={noHp}
                                onChange={(e) => setNoHp(e.target.value)}
                                pattern="^08[0-9]{8,13}$"
                                title="Nomor HP harus diawali 08 dan 10–15 digit"
                                required
                            />
                        </div>

                        {/* Tahun Masuk — khusus mahasiswa */}
                        {data?.isMahasiswa && (
                            <div className="space-y-1">
                                <Label htmlFor="tahunMasuk">
                                    Tahun Masuk{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tahunMasuk"
                                    type="number"
                                    placeholder={`Contoh: ${currentYear - 1}`}
                                    value={tahunMasuk}
                                    onChange={(e) =>
                                        setTahunMasuk(e.target.value)
                                    }
                                    min="1990"
                                    max={String(currentYear)}
                                    required
                                />
                            </div>
                        )}

                        {/* Tempat Lahir — khusus mahasiswa */}
                        {data?.isMahasiswa && (
                            <div className="space-y-1">
                                <Label htmlFor="tempatLahir">
                                    Tempat Lahir{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tempatLahir"
                                    placeholder="Contoh: Semarang"
                                    value={tempatLahir}
                                    onChange={(e) =>
                                        setTempatLahir(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        )}

                        {/* Tanggal Lahir — khusus mahasiswa */}
                        {data?.isMahasiswa && (
                            <div className="space-y-1">
                                <Label htmlFor="tanggalLahir">
                                    Tanggal Lahir{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tanggalLahir"
                                    type="date"
                                    value={tanggalLahir}
                                    onChange={(e) =>
                                        setTanggalLahir(e.target.value)
                                    }
                                    max={`${currentYear - 15}-12-31`}
                                    required
                                />
                            </div>
                        )}

                        {/* Departemen */}
                        <div className="space-y-1">
                            <Label htmlFor="departemenId">
                                Departemen{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="departemenId"
                                value={departemenId}
                                onChange={(e) =>
                                    handleDeptChange(e.target.value)
                                }
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                        <div className="space-y-1">
                            <Label htmlFor="programStudiId">
                                Program Studi{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="programStudiId"
                                value={programStudiId}
                                onChange={(e) =>
                                    setProgramStudiId(e.target.value)
                                }
                                required
                                disabled={!departemenId}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">
                                    -- Pilih Program Studi --
                                </option>
                                {availableProdi.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            {!departemenId && (
                                <p className="text-xs text-gray-400">
                                    Pilih departemen terlebih dahulu
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full"
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
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
